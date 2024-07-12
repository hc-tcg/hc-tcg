import {PlayerId, PlayerModel} from './player-model'
import {
	TurnAction,
	GameState,
	ActionResult,
	TurnActions,
	Message,
	PlayerEntity,
} from '../types/game-state'
import {getGameState, setupEcs} from '../utils/state-gen'
import {
	CopyAttack,
	ModalRequest,
	PickInfo,
	PickRequest,
	SelectCards,
} from '../types/server-requests'
import {BattleLogModel} from './battle-log-model'
import {ComponentQuery, card, query, row, slot} from '../components/query'
import {CardComponent, PlayerComponent, RowComponent, SlotComponent} from '../components'
import {AttackDefs} from '../types/attack'
import {AttackModel} from './attack-model'
import ECS from '../types/ecs'

export class GameModel {
	private internalCreatedTime: number
	private internalId: string
	private internalCode: string | null

	public chat: Array<Message>
	public battleLog: BattleLogModel
	public players: Record<PlayerId, PlayerModel>
	public task: any
	public state: GameState
	public components: ECS

	public endInfo: {
		deadPlayerIds: Array<string>
		winner: string | null
		outcome: 'timeout' | 'forfeit' | 'tie' | 'player_won' | 'error' | null
		reason: 'hermits' | 'lives' | 'cards' | 'time' | null
	}

	constructor(player1: PlayerModel, player2: PlayerModel, code: string | null = null) {
		this.internalCreatedTime = Date.now()
		this.internalId = 'game_' + Math.random().toString()
		this.internalCode = code
		this.chat = []
		this.battleLog = new BattleLogModel(this)

		this.task = null

		this.endInfo = {
			deadPlayerIds: [],
			winner: null,
			outcome: null,
			reason: null,
		}

		this.players = {
			[player1.id]: player1,
			[player2.id]: player2,
		}

		this.components = new ECS(this)
		setupEcs(this.components, player1, player2)

		this.state = getGameState(this)
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

	public findOpponentActiveRow(): RowComponent | null {
		return this.components.find(RowComponent, row.active, row.player(this.opponentPlayerEntity))
	}

	public getPlayerIds() {
		return Object.keys(this.players) as Array<PlayerId>
	}

	public getPlayers() {
		return Object.values(this.players)
	}

	public get createdTime() {
		return this.internalCreatedTime
	}

	public get id() {
		return this.internalId
	}

	public get code() {
		return this.internalCode
	}

	public otherPlayerEntity(player: PlayerEntity): PlayerEntity {
		const otherPlayer = this.components.findEntity(
			PlayerComponent,
			(game, otherPlayer) => player !== otherPlayer.entity
		)
		if (!otherPlayer)
			throw new Error('Can not query for other before because both player components are created')
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
			this.state.turn.completedActions = this.state.turn.completedActions.filter(
				(action) => !actions.includes(action)
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
				(action) => !actions.includes(action)
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

	public setLastActionResult(action: TurnAction, result: ActionResult) {
		this.state.lastActionResult = {action, result}
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
		if (this.state.pickRequests[0]?.playerId === this.currentPlayerEntity) {
			// Cancel and clear pick requests
			for (let i = 0; i < this.state.pickRequests.length; i++) {
				this.state.pickRequests[i].onCancel?.()
			}
			this.state.pickRequests = []
		}
	}

	public addModalRequest(newRequest: SelectCards.Request, before?: boolean): void
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
		return this.state.pickRequests.length > 0 || this.state.modalRequests.length > 0
	}

	/** Update the cards that the players are able to select */
	public updateCardsCanBePlacedIn() {
		const getCardsCanBePlacedIn = (player: PlayerComponent) => {
			return this.components
				.filter(CardComponent, card.slot(slot.hand, slot.player(player.entity)))
				.map(
					(card) =>
						[card, this.getPickableSlots(card.card.props.attachCondition)] as [
							CardComponent,
							PickInfo[],
						]
				)
		}

		this.currentPlayer.cardsCanBePlacedIn = getCardsCanBePlacedIn(this.currentPlayer)
		this.opponentPlayer.cardsCanBePlacedIn = getCardsCanBePlacedIn(this.opponentPlayer)
	}

	/** Helper method to change the active row. Returns whether or not the change was successful. */
	public changeActiveRow(player: PlayerComponent, newRow: RowComponent): boolean {
		const currentActiveRow = this.components.get(player.activeRowEntity)

		// Can't change to existing active row
		if (newRow === currentActiveRow) return false

		// Call before active row change hooks - if any of the results are false do not change
		if (currentActiveRow) {
			const results = player.hooks.beforeActiveRowChange.call(currentActiveRow?.index, newRow.index)
			if (results.includes(false)) return false
		}

		// Create battle log entry
		if (newRow !== null) {
			const newHermit = this.components.findEntity(
				CardComponent,
				card.isHermit,
				card.slot(slot.row(currentActiveRow?.entity))
			)
			const oldHermit = this.components.findEntity(
				CardComponent,
				card.isHermit,
				card.slot(slot.row(newRow.entity))
			)
			this.battleLog.addChangeRowEntry(player, newRow.entity, oldHermit, newHermit)
		}

		// Change the active row
		player.activeRowEntity = newRow.entity

		// Call on active row change hooks
		if (currentActiveRow) {
			player.hooks.onActiveRowChange.call(currentActiveRow.index, newRow.index)
		}

		return true
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
	 */
	public swapSlots(slotA: SlotComponent | null, slotB: SlotComponent | null): void {
		if (!slotA || !slotB) return

		const slotACards = this.components.filter(CardComponent, card.slotIs(slotA.entity))
		const slotBCards = this.components.filter(CardComponent, card.slotIs(slotB.entity))

		slotACards.forEach((card) => {
			card.slotEntity = slotB.entity
		})
		slotBCards.forEach((card) => {
			card.slotEntity = slotA.entity
		})
	}

	public getPickableSlots(predicate: ComponentQuery<SlotComponent>): Array<PickInfo> {
		return this.components.filter(SlotComponent, predicate).map((slotInfo) => {
			return {
				entity: slotInfo.entity,
				type: slotInfo.type,
			}
		})
	}
}
