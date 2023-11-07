import {PlayerModel} from './player-model'
import {TurnAction, GameState, ActionResult, TurnActions} from '../types/game-state'
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
	public addBlockedActions(...actions: TurnActions) {
		for (let i = 0; i < actions.length; i++) {
			const action = actions[i]
			if (!this.state.turn.blockedActions.includes(action)) {
				this.state.turn.blockedActions.push(action)
			}
		}
	}
	/** Remove action from the completed list so they can be done again this turn */
	public removeBlockedActions(...actions: TurnActions) {
		for (let i = 0; i < actions.length; i++) {
			this.state.turn.blockedActions = this.state.turn.blockedActions.filter(
				(action) => !actions.includes(action)
			)
		}
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
}

// thoughts going on now
/*
I need to have a customMessage property on each player state
I need to have a new action called PICK_REQUEST

no, I need a way for the actual picks themselves to be variable in the same way

so as an example, the client would send the action PRIMARY_ATTACK to the server, and the server would return just one available action
that action would be PICK_REQUEST

if I think about the pick reqs they are anyways incredibly non extensible, so that means the client cannot know more than us wanting to pick *a* card
we can also seperate picking from board and hand to a completely seperate action

in the case of a single use card, we would send the action PLAY_SINGLE_USE_CARD to the server, and it would return not apply or anything but just PICK_REQUEST again

how would the server route the incoming PICK_REQUEST message to the card that activated the pick?
what if there was a card pick array which a card could add to, and then when determining available actions the server would take that into effect
that same array would also be where the pick message would be stored

maybe we call it a pickRequest
something like 
function: (pickInfoThingy) => ActionResult
message: string
location: hand | board

when we receive the PICK_REQUEST message we look to the top pickRequest, call the function, and if it returns success we remove that one and continue
if there's another this will repeat

assuming this goes on each player seperately we would need a WAIT_FOR_OPPONENT_ACTION action
in the case of tango then, once the attack is received we add a pickRequest to the opponent with a message to select an afk hermit
once we receive that pick and it's successful within that function we can carry on as normal

note that we won't allow adding temporary actions, it's just pick requests, which is also a complete drop in replacement for follow ups

pick requests can also be indexed by instance, so they will be a record. This means, for example
if we place the instant card, it adds a pick request to choose a hermit to heal. This is during onAttach.
 we need onDetach to be able to trigger within which we can remove our pick request by using the instance key.

that actually means REMOVE_EFFECT needs to be available even if we have a pickrequest active
but not APPLY_EFFECT.



let's talk client a second
first of all we need to send the pick message to the client - doing that now
if the client has an available action PICK_REQUEST

 ok client should now send pick card action to server if that action is available
 now let's set up the server to receive the message
 */
