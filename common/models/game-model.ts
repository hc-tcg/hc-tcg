import {broadcast} from '../../server/src/utils/comm'
import {
	CardComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
} from '../components'
import query, {ComponentQuery} from '../components/query'
import {ViewerComponent} from '../components/viewer-component'
import {CONFIG, DEBUG_CONFIG} from '../config'
import {PlayerEntity, SlotEntity} from '../entities'
import {ServerMessage} from '../socket-messages/server-messages'
import {AttackDefs} from '../types/attack'
import ComponentTable from '../types/ecs'
import {
	GameEndOutcomeT,
	GameEndReasonT,
	GameState,
	Message,
	TurnAction,
	TurnActions,
} from '../types/game-state'
import {GameHook, Hook, PriorityHook} from '../types/hooks'
import {CopyAttack, ModalRequest, SelectCards} from '../types/modal-requests'
import {afterAttack, beforeAttack} from '../types/priorities'
import {rowRevive} from '../types/priorities'
import {PickRequest} from '../types/server-requests'
import {
	PlayerSetupDefs,
	getGameState,
	setupComponents,
} from '../utils/state-gen'
import {AttackModel, ReadonlyAttackModel} from './attack-model'
import {BattleLogModel} from './battle-log-model'
import {PlayerId, PlayerModel} from './player-model'

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
	logBoardState: boolean
	disableRewardCards: boolean
}

export function gameSettingsFromEnv(): GameSettings {
	return {
		maxTurnTime: CONFIG.limits.maxTurnTime,
		extraActionTime: CONFIG.limits.extraActionTime,
		showHooksState: DEBUG_CONFIG.showHooksState,
		blockedActions: DEBUG_CONFIG.blockedActions,
		availableActions: DEBUG_CONFIG.availableActions,
		autoEndTurn: DEBUG_CONFIG.autoEndTurn,
		disableDeckOut: DEBUG_CONFIG.disableDeckOut,
		startWithAllCards: DEBUG_CONFIG.startWithAllCards,
		unlimitedCards: DEBUG_CONFIG.unlimitedCards,
		oneShotMode: DEBUG_CONFIG.oneShotMode,
		extraStartingCards: DEBUG_CONFIG.extraStartingCards,
		disableDamage: DEBUG_CONFIG.disableDamage,
		noItemRequirements: DEBUG_CONFIG.noItemRequirements,
		forceCoinFlip: DEBUG_CONFIG.forceCoinFlip,
		shuffleDeck: DEBUG_CONFIG.shuffleDeck,
		logErrorsToStderr: DEBUG_CONFIG.logErrorsToStderr,
		logBoardState: DEBUG_CONFIG.logBoardState,
		disableRewardCards: DEBUG_CONFIG.disableRewardCards,
	}
}

export class GameModel {
	private internalCreatedTime: number
	private internalId: string
	private internalGameCode: string | null
	private internalSpectatorCode: string | null
	private internalApiSecret: string | null

	public readonly settings: GameSettings

	public chat: Array<Message>
	public battleLog: BattleLogModel
	public task: any
	public state: GameState
	/** Voice lines to play on the next game state update.
	 * This is used for the Evil X boss fight.
	 */
	public voiceLineQueue: Array<string>

	/** The objects used in the game. */
	public components: ComponentTable
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
		winner: PlayerId | null
		outcome: GameEndOutcomeT | null
		reason: GameEndReasonT | null
	}

	constructor(
		player1: PlayerSetupDefs,
		player2: PlayerSetupDefs,
		settings: GameSettings,
		options?: {
			gameCode?: string
			apiSecret?: string
			spectatorCode?: string
			randomizeOrder?: false
		},
	) {
		options = options ?? {}

		this.settings = settings

		this.internalCreatedTime = Date.now()
		this.internalId = 'game_' + Math.random().toString()
		this.internalGameCode = options.gameCode || null
		this.internalSpectatorCode = options.spectatorCode || null
		this.internalApiSecret = options.apiSecret || null
		this.chat = []
		this.battleLog = new BattleLogModel(this)

		this.task = null

		this.endInfo = {
			deadPlayerEntities: [],
			winner: null,
			outcome: null,
			reason: null,
		}

		this.components = new ComponentTable(this)
		this.hooks = {
			beforeAttack: new PriorityHook(beforeAttack),
			rowRevive: new PriorityHook(rowRevive),
			afterAttack: new PriorityHook(afterAttack),
			freezeSlots: new GameHook(),
			afterGameEnd: new Hook(),
		}
		setupComponents(this.components, player1, player2, {
			shuffleDeck: settings.shuffleDeck,
			startWithAllCards: settings.startWithAllCards,
			unlimitedCards: settings.unlimitedCards,
			extraStartingCards: settings.extraStartingCards,
		})

		this.state = getGameState(this, options.randomizeOrder)
		this.voiceLineQueue = []
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

	public get viewers(): Array<ViewerComponent> {
		return this.components.filter(ViewerComponent)
	}

	public get players() {
		return this.viewers.reduce(
			(acc, viewer) => {
				acc[viewer.player.id] = viewer.player
				return acc
			},
			{} as Record<PlayerId, PlayerModel>,
		)
	}

	public getPlayers() {
		return this.viewers.map((viewer) => viewer.player)
	}

	public get createdTime() {
		return this.internalCreatedTime
	}

	public get id() {
		return this.internalId
	}

	public get gameCode() {
		return this.internalGameCode
	}

	public get spectatorCode() {
		return this.internalSpectatorCode
	}

	public get apiSecret() {
		return this.internalApiSecret
	}

	public broadcastToViewers(payload: ServerMessage) {
		broadcast(
			this.viewers.map((viewer) => viewer.player),
			payload,
		)
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
	public addModalRequest(newRequest: CopyAttack.Request, before?: boolean): void
	public addModalRequest(newRequest: ModalRequest, before = false) {
		if (before) {
			this.state.modalRequests.unshift(newRequest)
		} else {
			this.state.modalRequests.push(newRequest)
		}
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

		const slotACards = this.components.filter(
			CardComponent,
			query.card.slotEntity(slotA.entity),
		)
		const slotBCards = this.components.filter(
			CardComponent,
			query.card.slotEntity(slotB.entity),
		)

		slotACards.forEach((card) => {
			card.attach(slotB)
		})
		slotBCards.forEach((card) => {
			card.attach(slotA)
		})
	}

	public getPickableSlots(
		predicate: ComponentQuery<SlotComponent>,
	): Array<SlotEntity> {
		return this.components
			.filter(SlotComponent, predicate)
			.map((slotInfo) => slotInfo.entity)
	}
}
