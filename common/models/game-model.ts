import assert from 'assert'
import {ReplayActionData} from '../../server/src/routines/turn-action-compressor'
import JoeHillsRare from '../cards/hermits/joehills-rare'
import {
	CardComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../components'
import query, {ComponentQuery} from '../components/query'
import {CONFIG} from '../config'
import {PlayerEntity, SlotEntity} from '../entities'
import {
	PlayerSetupDefs,
	getGameState,
	setupComponents,
} from '../game/setup-game'
import {
	MultiturnPrimaryAttackDisabledEffect,
	MultiturnSecondaryAttackDisabledEffect,
} from '../status-effects/multiturn-attack-disabled'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from '../status-effects/singleturn-attack-disabled'
import TimeSkipDisabledEffect from '../status-effects/time-skip-disabled'
import {AttackDefs} from '../types/attack'
import ComponentTable from '../types/ecs'
import {
	GameOutcome,
	GameState,
	GameVictoryReason,
	Message,
	TurnAction,
	TurnActions,
} from '../types/game-state'
import {GameHook, Hook, PriorityHook} from '../types/hooks'
import {
	CopyAttack,
	DragCards,
	ModalRequest,
	ModalResult,
	SelectCards,
} from '../types/modal-requests'
import {afterAttack, beforeAttack} from '../types/priorities'
import {rowRevive} from '../types/priorities'
import {PickRequest} from '../types/server-requests'
import {newIncrementor} from '../utils/game'
import {newRandomNumberGenerator} from '../utils/random'
import {AttackModel, ReadonlyAttackModel} from './attack-model'
import {BattleLogModel} from './battle-log-model'

export type GameSettings = {
	maxTurnTime: number
	extraActionTime: number
	showHooksState: {
		enabled: boolean
		clearConsole: boolean
	}
	blockedActions: Array<TurnAction>
	availableActions: Array<TurnAction>
	autoEndTurn: boolean
	disableDeckOut: boolean
	startWithAllCards: boolean
	unlimitedCards: boolean
	oneShotMode: boolean
	extraStartingCards: Array<string>
	disableDamage: boolean
	noItemRequirements: boolean
	forceCoinFlip: boolean
	shuffleDeck: boolean
	logErrorsToStderr: boolean
	verboseLogging: boolean
	disableRewardCards: boolean
	gameTimeout: number
	logAttackHistory: boolean
}

export function gameSettingsFromEnv(): GameSettings {
	return {
		maxTurnTime: CONFIG.game.limits.maxTurnTime,
		extraActionTime: CONFIG.game.limits.extraActionTime,
		showHooksState: CONFIG.game.showHooksState,
		blockedActions: CONFIG.game.blockedActions,
		availableActions: CONFIG.game.availableActions,
		autoEndTurn: CONFIG.game.autoEndTurn,
		disableDeckOut: CONFIG.game.disableDeckOut,
		startWithAllCards: CONFIG.game.startWithAllCards,
		unlimitedCards: CONFIG.game.unlimitedCards,
		oneShotMode: CONFIG.game.oneShotMode,
		extraStartingCards: CONFIG.game.extraStartingCards,
		disableDamage: CONFIG.game.disableDamage,
		noItemRequirements: CONFIG.game.noItemRequirements,
		forceCoinFlip: CONFIG.game.forceCoinFlip,
		shuffleDeck: CONFIG.game.shuffleDeck,
		logErrorsToStderr: CONFIG.game.logErrorsToStderr,
		verboseLogging: CONFIG.game.verboseLogging,
		disableRewardCards: CONFIG.game.disableRewardCards,
		gameTimeout: CONFIG.game.limits.gameTimeout,
		logAttackHistory: CONFIG.game.logAttackHistory,
	}
}

export class GameModel {
	public rng: () => number
	public nextEntity: () => number
	private entityCount: number

	public readonly id: string
	public readonly settings: GameSettings
	public publishBattleLog: (logs: Array<Message>, timeout: number) => void

	public battleLog: BattleLogModel
	/**All past turn actions, saved for replays */
	public turnActions: Array<ReplayActionData>
	/**The time the last action has been recieved*/
	public lastActionTime: number | null

	public state: GameState
	/** The seed for the random number generation for this game. WARNING: Must be under 15 characters or the database will break. */
	public readonly rngSeed: string
	/** Voice lines to play on the next game state update.
	 * This is used for the Evil X boss fight.
	 */
	public voiceLineQueue: Array<string>

	/** The objects used in the game. */
	public components: ComponentTable

	public arePlayersSwapped: boolean

	public hooks: {
		/** Hook called before the main attack loop, for every attack from any source */
		beforeAttack: PriorityHook<
			(attack: AttackModel) => void,
			typeof beforeAttack
		>
		/** Hook called after the main attack loop, one stage at a time, for every attack from any source */
		afterAttack: PriorityHook<
			(attack: ReadonlyAttackModel) => void,
			typeof afterAttack
		>
		/** Hook called when the `slot.locked` combinator is called.
		 * Returns a combinator that verifies if the slot is locked or not.
		 * Locked slots cannot be chosen in some combinator expressions.
		 */
		freezeSlots: GameHook<() => ComponentQuery<SlotComponent>>
		/** Hook called when the game ends for achievements to check how the game ended */
		onGameEnd: GameHook<(outcome: GameOutcome) => void>
		/** Hook called when modal request is responded to by a player */
		onPickRequestResolve: GameHook<
			(request: PickRequest, slot: SlotComponent) => void
		>
		/** Hook called when pick request is responded to by a player */
		onModalRequestResolve: GameHook<
			(request: ModalRequest, result: ModalResult) => void
		>
		/** Hook called when the game ends for disposing references */
		afterGameEnd: Hook<string, () => void>
		/** Hook for reviving rows after all attacks are executed */
		rowRevive: PriorityHook<
			(attack: ReadonlyAttackModel) => void,
			typeof rowRevive
		>
	}

	public endInfo: {
		deadPlayerEntities: Array<PlayerEntity>
		victoryReason?: GameVictoryReason
	}
	public outcome?: GameOutcome

	constructor(
		rngSeed: string,
		player1: PlayerSetupDefs,
		player2: PlayerSetupDefs,
		settings: GameSettings,
		options?: {
			randomizeOrder?: boolean
			id?: string
			publishBattleLog?: (logs: Array<Message>, timeout: number) => void
		},
	) {
		options = options ?? {}
		this.id = options.id || Math.random().toString(16).slice(3, 11)

		if (options?.publishBattleLog) {
			this.publishBattleLog = options.publishBattleLog
		} else {
			this.publishBattleLog = () => {}
		}

		this.settings = settings
		assert(rngSeed.length < 16, 'Game RNG seed must be under 16 characters')
		this.rngSeed = rngSeed
		this.rng = newRandomNumberGenerator(rngSeed)
		this.entityCount = 0
		this.nextEntity = newIncrementor()
		const swapPlayers = this.rng()

		this.battleLog = new BattleLogModel(this)
		this.turnActions = []
		this.lastActionTime = null

		this.endInfo = {
			deadPlayerEntities: [],
			victoryReason: undefined,
		}

		this.components = new ComponentTable(this)
		this.hooks = {
			beforeAttack: new PriorityHook(beforeAttack),
			rowRevive: new PriorityHook(rowRevive),
			afterAttack: new PriorityHook(afterAttack),
			freezeSlots: new GameHook(),
			onGameEnd: new GameHook(),
			onModalRequestResolve: new GameHook(),
			onPickRequestResolve: new GameHook(),
			afterGameEnd: new Hook(),
		}

		setupComponents(this, this.components, player1, player2, {
			shuffleDeck: settings.shuffleDeck,
			startWithAllCards: settings.startWithAllCards,
			unlimitedCards: settings.unlimitedCards,
			extraStartingCards: settings.extraStartingCards,
		})

		this.arePlayersSwapped = options.randomizeOrder ? swapPlayers >= 0.5 : false

		this.state = getGameState(this, this.arePlayersSwapped)
		this.voiceLineQueue = []
	}

	static newGameSeed(): string {
		return Math.random().toString(16).slice(0, 15)
	}

	public get logHeader() {
		return `Game ${this.id}:`
	}

	public get currentPlayerEntity() {
		return this.state.order[(this.state.turn.turnNumber + 1) % 2]
	}

	public get opponentPlayerEntity() {
		return this.state.order[this.state.turn.turnNumber % 2]
	}

	public get currentPlayer(): PlayerComponent {
		return this.components.getOrError(this.currentPlayerEntity)
	}

	public get opponentPlayer(): PlayerComponent {
		return this.components.getOrError(this.opponentPlayerEntity)
	}

	public otherPlayerEntity(player: PlayerEntity): PlayerEntity {
		const otherPlayer = this.components.findEntity(
			PlayerComponent,
			(_game, otherPlayer) => player !== otherPlayer.entity,
		)
		if (!otherPlayer)
			throw new Error(
				'Can not query for other before because both player components are created',
			)
		return otherPlayer
	}

	// Functions

	/** Set actions as completed so they cannot be done again this turn */
	public addCompletedActions(...actions: TurnActions) {
		for (let i = 0; i < actions.length; i++) {
			const action = actions[i]
			if (!this.state.turn.completedActions.includes(action)) {
				this.state.turn.completedActions.push(action)
			}
		}
	}

	/** Remove action from the completed list so they can be done again this turn */
	public removeCompletedActions(...actions: TurnActions) {
		for (let i = 0; i < actions.length; i++) {
			this.state.turn.completedActions =
				this.state.turn.completedActions.filter(
					(action) => !actions.includes(action),
				)
		}
	}

	/** Set actions as blocked so they cannot be done this turn */
	public addBlockedActions(sourceId: string, ...actions: TurnActions) {
		const key = sourceId
		const turnState = this.state.turn
		if (!turnState.blockedActions[key]) {
			turnState.blockedActions[key] = []
		}

		for (let i = 0; i < actions.length; i++) {
			const action = actions[i]
			if (!turnState.blockedActions[key].includes(action)) {
				turnState.blockedActions[key].push(action)
			}
		}
	}
	/** Remove action from the completed list so they can be done again this turn */
	public removeBlockedActions(sourceId: string, ...actions: TurnActions) {
		const key = sourceId
		const turnState = this.state.turn
		if (!turnState.blockedActions[key]) return

		for (let i = 0; i < actions.length; i++) {
			turnState.blockedActions[key] = turnState.blockedActions[key].filter(
				(action) => !actions.includes(action),
			)
		}

		if (turnState.blockedActions[key].length <= 0) {
			delete turnState.blockedActions[key]
		}
	}

	/** Returns true if the current blocked actions list includes the given action */
	public isActionBlocked(action: TurnAction, excludeIds?: Array<string>) {
		const turnState = this.state.turn
		const allBlockedActions: TurnActions = []
		Object.keys(turnState.blockedActions).forEach((sourceId) => {
			if (excludeIds?.includes(sourceId)) return

			const actions = turnState.blockedActions[sourceId]
			allBlockedActions.push(...actions)
		})
		return allBlockedActions.includes(action)
	}

	/** Get all actions blocked with the source id. */
	public getBlockedActions(sourceId: string) {
		const key = sourceId || ''
		const turnState = this.state.turn
		const blockedActions = turnState.blockedActions[key]
		if (!blockedActions) return []

		return blockedActions
	}
	public getAllBlockedActions() {
		const turnState = this.state.turn
		const allBlockedActions: TurnActions = []
		Object.values(turnState.blockedActions).forEach((actions) => {
			allBlockedActions.push(...actions)
		})
		return allBlockedActions
	}

	public addPickRequest(newRequest: PickRequest, before = false) {
		if (before) {
			this.state.pickRequests.unshift(newRequest)
		} else {
			this.state.pickRequests.push(newRequest)
		}
	}
	public removePickRequest(index = 0, timeout = true) {
		if (this.state.pickRequests[index] !== undefined) {
			const request = this.state.pickRequests.splice(index, 1)[0]
			if (timeout) {
				request.onTimeout?.()
			}
		}
	}
	public cancelPickRequests() {
		if (this.state.pickRequests[0]?.player === this.currentPlayer.entity) {
			// Cancel and clear pick requests
			for (let i = 0; i < this.state.pickRequests.length; i++) {
				this.state.pickRequests[i].onCancel?.()
			}
			this.state.pickRequests = []
		}
	}

	public addModalRequest(
		newRequest: SelectCards.Request,
		before?: boolean,
	): void
	public addModalRequest(newRequest: DragCards.Request, before?: boolean): void
	public addModalRequest(newRequest: CopyAttack.Request, before?: boolean): void
	public addModalRequest(newRequest: ModalRequest, before = false) {
		if (before) {
			this.state.modalRequests.unshift(newRequest)
		} else {
			this.state.modalRequests.push(newRequest)
		}
	}

	public addPickAttackModalRequest(
		newRequest: Omit<CopyAttack.Request, 'modal'> & {
			modal: Omit<CopyAttack.Request['modal'], 'availableAttacks'>
		},
		mode: 'copy' | 'disable',
		before = false,
	) {
		let modal = newRequest.modal
		let hermitCard = this.components.get(modal.hermitCard)!
		/** If true, prevents picking attacks that are unable to be used */
		const excludeDisabledAttacks = mode === 'copy'
		let blockedActions = excludeDisabledAttacks
			? hermitCard.player.hooks.blockedActions.callSome(
					[[]],
					(observerEntity) => {
						let observer = this.components.get(observerEntity)
						return observer?.wrappingEntity === hermitCard.entity
					},
				)
			: []

		/* Due to an issue with the blocked actions system, we have to check if our target has thier action
		 * blocked by status effects here.
		 */
		if (
			this.components.exists(
				StatusEffectComponent,
				query.effect.is(
					PrimaryAttackDisabledEffect,
					MultiturnPrimaryAttackDisabledEffect,
				),
				query.effect.targetIsCardAnd(
					query.card.entity(hermitCard.entity),
					query.card.currentPlayer,
				),
			) ||
			(hermitCard.isHermit() && hermitCard.props.primary.passive)
		) {
			blockedActions.push('PRIMARY_ATTACK')
		}

		if (
			this.components.exists(
				StatusEffectComponent,
				query.effect.is(
					SecondaryAttackDisabledEffect,
					MultiturnSecondaryAttackDisabledEffect,
				),
				query.effect.targetIsCardAnd(
					query.card.entity(hermitCard.entity),
					query.card.currentPlayer,
				),
			) ||
			(hermitCard.isHermit() && hermitCard.props.secondary.passive)
		) {
			blockedActions.push('SECONDARY_ATTACK')
		}

		if (
			excludeDisabledAttacks &&
			this.components.exists(
				StatusEffectComponent,
				query.effect.is(TimeSkipDisabledEffect),
				query.effect.targetIsPlayerAnd(query.player.currentPlayer),
			) &&
			query.card.is(JoeHillsRare)(this, hermitCard)
		)
			blockedActions.push('SECONDARY_ATTACK')

		let attacks: Array<'primary' | 'secondary'> = ['primary', 'secondary']

		if (blockedActions.includes('PRIMARY_ATTACK')) {
			attacks = attacks.filter((x) => x != 'primary')
		}
		if (blockedActions.includes('SECONDARY_ATTACK')) {
			attacks = attacks.filter((x) => x != 'secondary')
		}

		const request: CopyAttack.Request = {
			...newRequest,
			modal: {...modal, availableAttacks: attacks},
		}
		this.addModalRequest(request, before)
	}

	public removeModalRequest(index = 0, timeout = true) {
		if (this.state.modalRequests[index] !== undefined) {
			const request = this.state.modalRequests.splice(index, 1)[0]
			if (timeout) {
				request.onTimeout()
			}
		}
	}

	public newAttack(defs: AttackDefs): AttackModel {
		return new AttackModel(this, defs)
	}

	public hasActiveRequests(): boolean {
		return (
			this.state.pickRequests.length > 0 || this.state.modalRequests.length > 0
		)
	}

	/**Helper method to swap the positions of two rows on the board. Returns whether or not the change was successful. */
	public swapRows(oldRow: RowComponent, newRow: RowComponent) {
		let oldIndex = oldRow.index
		oldRow.index = newRow.index
		newRow.index = oldIndex
	}

	/**
	 * Swaps the positions of two cards on the board.
	 * This function does not check whether the cards can be placed in the other card's slot.
	 * If one of the slots is undefined, do not swap the slots.
	 */
	public swapSlots(
		slotA: SlotComponent | null,
		slotB: SlotComponent | null,
	): void {
		if (!slotA || !slotB) return

		const slotACard = this.components.find(
			CardComponent,
			query.card.slotEntity(slotA.entity),
		)
		const slotBCard = this.components.find(
			CardComponent,
			query.card.slotEntity(slotB.entity),
		)

		slotACard?.attach(slotB)
		slotBCard?.attach(slotA)

		/* I don't know why these two lines are required, but don't delete them because the tests fail! */
		slotA.cardEntity = slotBCard?.entity ?? null
		slotB.cardEntity = slotACard?.entity ?? null
	}

	public getPickableSlots(
		predicate: ComponentQuery<SlotComponent>,
	): Array<SlotEntity> {
		return this.components
			.filter(SlotComponent, predicate)
			.map((slotInfo) => slotInfo.entity)
	}
}
