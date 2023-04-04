import {AnyAction} from 'redux'
import {LocalGameRoot} from 'common/types/game-state'
import {equalCard} from 'server/utils'

const defaultState: LocalGameRoot = {
	localGameState: null,
	time: 0,

	selectedCard: null,
	openedModal: null,
	pickProcess: null,
	endGameOverlay: null,
	chat: [],
	currentCoinFlip: null,
	opponentConnected: true,
}

const gameReducer = (
	state = defaultState,
	action: AnyAction
): LocalGameRoot => {
	switch (action.type) {
		case 'GAME_STATE':
			const newGame: LocalGameRoot = {
				...state,
				localGameState: action.payload.localGameState,
				time: action.payload.time,
				openedModal: null,
				pickProcess: null,
			}
			if (
				state.localGameState?.currentPlayerId ===
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
				pickProcess: null,
				endGameOverlay: null,
				currentCoinFlip: null,
				chat: [],
				opponentConnected: true,
			}

		case 'SET_SELECTED_CARD':
			if (state.pickProcess) return state
			return {
				...state,
				selectedCard: equalCard(action.payload, state.selectedCard)
					? null
					: action.payload,
			}
		case 'SET_OPENED_MODAL':
			return {
				...state,
				openedModal: action.payload,
			}
		case 'SET_PICK_PROCESS':
			return {
				...state,
				selectedCard: null,
				pickProcess: action.payload,
			}
		case 'UPDATE_PICK_PROCESS': {
			if (!state.pickProcess) return state
			return {
				...state,
				pickProcess: {
					...state.pickProcess,
					...action.payload,
				},
			}
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
		default:
			return state
	}
}

export default gameReducer
