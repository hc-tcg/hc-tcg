import {PlayerModel} from './player-model'
import {
	TurnAction,
	GameState,
	ActionResult,
	TurnActions,
	PlayerState,
	Message,
	CardComponent,
	PlayerId,
} from '../types/game-state'
import {getGameState} from '../utils/state-gen'
import {
	CopyAttack,
	ModalRequest,
	PickInfo,
	PickRequest,
	SelectCards,
} from '../types/server-requests'
import {BattleLogModel} from './battle-log-model'
import {SlotCondition, card, slot} from '../filters'
import {RowComponent, SlotComponent} from '../types/cards'

export class GameModel {
	private internalCreatedTime: number
	private internalId: string
	private internalCode: string | null

	public chat: Array<Message>
	public battleLog: BattleLogModel
	public players: Record<string, PlayerModel>
	public task: any
	public state: GameState

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

		this.state = getGameState(this)
	}

	public get currentPlayerId() {
		return this.state.order[(this.state.turn.turnNumber + 1) % 2]
	}

	public get opponentPlayerId() {
		return this.state.order[this.state.turn.turnNumber % 2]
	}

	public get currentPlayer() {
		return this.state.players[this.currentPlayerId]
	}

	public get opponentPlayer() {
		return this.state.players[this.opponentPlayerId]
	}

	public get opponentActiveRow() {
		const player = this.opponentPlayer
		return player.activeRowEntity !== null ? this.state.rows.get(player.activeRowEntity) : null
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

	public otherPlayer(player: PlayerId) {
		return this.getPlayerIds().filter((id) => id != player)[0]
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
		if (this.state.pickRequests[0]?.playerId === this.currentPlayerId) {
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

	public hasActiveRequests(): boolean {
		return this.state.pickRequests.length > 0 || this.state.modalRequests.length > 0
	}

	/** Update the cards that the players are able to select */
	public updateCardsCanBePlacedIn() {
		const getCardsCanBePlacedIn = (player: PlayerState) => {
			return this.state.cards
				.filter(card.slotFulfills(slot.hand, slot.player(player.id)))
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
	public changeActiveRow(player: PlayerState, newRow: RowComponent): boolean {
		const currentActiveRow = this.state.rows.get(player.activeRowEntity)

		// Can't change to existing active row
		if (newRow === currentActiveRow) return false

		// Call before active row change hooks - if any of the results are false do not change
		if (currentActiveRow) {
			const results = player.hooks.beforeActiveRowChange.call(currentActiveRow?.index, newRow.index)
			if (results.includes(false)) return false
		}

		// Create battle log entry
		if (newRow !== null) {
			const newHermit = this.state.cards.find(
				card.hermit,
				card.slotFulfills(slot.row(currentActiveRow?.entity))
			)
			const oldHermit = this.state.cards.find(
				card.hermit,
				card.slotFulfills(slot.row(newRow.entity))
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
	public swapRows(player: PlayerState, oldRow: RowComponent, newRow: RowComponent) {
		let oldIndex = oldRow.index
		oldRow.index = newRow.index
		newRow.index = oldIndex
	}

	/**
	 * Swaps the positions of two cards on the board.
	 * This function does not check whether the cards can be placed in the other card's slot.
	 */
	public swapSlots(
		slotA: SlotComponent | null,
		slotB: SlotComponent | null,
		withoutDetach: boolean = false
	): void {
		if (!slotA || !slotB) return

		const slotACards = this.state.cards.filter(card.slot(slotA.entity))
		const slotBCards = this.state.cards.filter(card.slot(slotB.entity))

		slotACards.forEach((card) => {
			card.slot = slotB
		})
		slotBCards.forEach((card) => {
			card.slot = slotA
		})

		if (!withoutDetach) {
			// onAttach
			;[...slotACards, ...slotBCards].forEach((card) => {
				card.card.onAttach(this, card)
				card.player.hooks.onAttach.call(card)
			})
		}
	}

	public getPickableSlots(predicate: SlotCondition): Array<PickInfo> {
		console.log(this.state.slots.filter(predicate))
		return this.state.slots.filter(predicate).map((slotInfo) => {
			return {
				entity: slotInfo.entity,
				type: slotInfo.type,
			}
		})
	}
}
