import {LocalGameRoot} from 'common/types/game-state'
import {LocalMessage, actions} from 'logic/actions'

const defaultState: LocalGameRoot = {
	localGameState: null,
	time: 0,

	selectedCard: null,
	openedModal: null,
	endGameOverlay: null,
	chat: [],
	battleLog: null,
	currentCoinFlip: null,
	opponentConnected: true,
}

const gameReducer = (
	state = defaultState,
	action: LocalMessage,
): LocalGameRoot => {
	switch (action.type) {
		case actions.GAME_LOCAL_STATE:
			const newGame: LocalGameRoot = {
				...state,
				localGameState: action.localGameState,
				time: action.time,
				openedModal: null,
			}
			if (
				state.localGameState?.turn.currentPlayerEntity ===
				action.localGameState?.turn.currentPlayerEntity
			)
				return newGame
			return {...newGame}
		case actions.GAME_START:
		case actions.GAME_END:
			return {
				...state,
				localGameState: null,
				time: 0,
				selectedCard: null,
				openedModal: null,
				endGameOverlay: null,
				currentCoinFlip: null,
				chat: [],
				battleLog: null,
				opponentConnected: true,
			}

		case actions.GAME_CARD_SELECTED_SET:
			return {
				...state,
				selectedCard: action.card,
			}
		case actions.GAME_MODAL_OPENED_SET:
			return {
				...state,
				openedModal: action.id ? {id: action.id, info: action.info} : null,
			}
		case actions.GAME_END_OVERLAY_SHOW:
			return {
				...state,
				endGameOverlay:
					action.reason && action.outcome
						? {
								reason: action.reason,
								outcome: action.outcome,
							}
						: null,
			}
		case actions.CHAT_UPDATE:
			return {
				...state,
				chat: action.messages,
			}
		case actions.GAME_OPPONENT_CONNECTION_SET:
			return {
				...state,
				opponentConnected: action.connected,
			}
		case actions.GAME_COIN_FLIP_SET:
			return {
				...state,
				currentCoinFlip: action.coinFlip,
			}
		// Update the board for the current player. This is used to put cards on the board before the
		// server sends the new state.
		// This updates based on outside mutations because I am so confused by redux and I want to ship
		// the release tomorrow.
		case actions.GAME_UPDATE:
			return state

		default:
			return state
	}
}

export default gameReducer
