import {PlayerModel} from './player-model'
import {TurnAction, GameState, ActionResult, TurnActions, PlayerState} from '../types/game-state'
import {MessageInfoT} from '../types/chat'
import {getGameState} from '../utils/state-gen'
import {ModalRequest, PickRequest} from '../types/server-requests'

export class GameModel {
	private internalCreatedTime: number
	private internalId: string
	private internalCode: string | null

	public chat: Array<MessageInfoT>
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

		this.task = null

		this.endInfo = {
			deadPlayerIds: [],
			winner: null,
			outcome: null,
			reason: null,
		}

		this.players = {
			[player1.playerId]: player1,
			[player2.playerId]: player2,
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

	public get activeRow() {
		const player = this.currentPlayer
		return player.board.activeRow !== null ? player.board.rows[player.board.activeRow] : null
	}

	public get opponentActiveRow() {
		const player = this.opponentPlayer
		return player.board.activeRow !== null ? player.board.rows[player.board.activeRow] : null
	}

	public getPlayerIds() {
		return Object.keys(this.players)
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
	public addBlockedActions(sourceId: string | null, ...actions: TurnActions) {
		const key = sourceId || ''
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
	public removeBlockedActions(sourceId: string | null, ...actions: TurnActions) {
		const key = sourceId || ''
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

	public isActionBlocked(action: TurnAction, excludeIds?: Array<string | null>) {
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
	public getBlockedActions(sourceId: string | null) {
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

	/** Helper method to change the active row. Returns whether or not the change was successful. */
	public changeActiveRow(player: PlayerState, newRow: number | null): boolean {
		const currentActiveRow = player.board.activeRow

		// Can't change to existing active row
		if (newRow === currentActiveRow) return false

		// Call before active row change hooks - if any of the results are false do not change
		const results = player.hooks.beforeActiveRowChange.call(currentActiveRow, newRow)
		if (results.includes(false)) return false

		// Change the active row
		player.board.activeRow = newRow

		// Call on active row change hooks
		player.hooks.onActiveRowChange.call(currentActiveRow, newRow)

		return true
	}
}
