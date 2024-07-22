import {AnyAction} from 'redux'
import {LocalGameRoot} from 'common/types/game-state'

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

const gameReducer = (state = defaultState, action: AnyAction): LocalGameRoot => {
	switch (action.type) {
		case 'LOCAL_GAME_STATE':
			const newGame: LocalGameRoot = {
				...state,
				localGameState: action.payload.localGameState,
				time: action.payload.time,
				openedModal: null,
			}
			if (
				state.localGameState?.turn.currentPlayerId ===
				action.payload.localGameState?.currentPlayerId
			)
				return newGame
			return {...newGame}
		case 'GAME_START':
		case 'GAME_END':
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

		case 'SET_SELECTED_CARD':
			return {
				...state,
				selectedCard: action.payload,
			}
		case 'SET_OPENED_MODAL':
			return {
				...state,
				openedModal: action.payload,
			}
		case 'SHOW_END_GAME_OVERLAY':
			return {
				...state,
				endGameOverlay: action.payload,
			}
		case 'CHAT_UPDATE':
			return {
				...state,
				chat: action.payload,
			}
		case 'SET_OPPONENT_CONNECTION':
			return {
				...state,
				opponentConnected: action.payload,
			}
		case 'SET_COIN_FLIP':
			return {
				...state,
				currentCoinFlip: action.payload,
			}
		// Update the board for the current player. This is used to put cards on the board before the
		// server sends the new state.
		// This updates based on outside mutations because I am so confused by redux and I want to ship
		// the release tomorrow.
		case 'UPDATE_BOARD':
			return state

		default:
			return state
	}
}

export default gameReducer
