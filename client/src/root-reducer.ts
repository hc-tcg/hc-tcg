import {AnyAction} from 'redux'
import {GameState, CardT} from 'types/game-state'
import {PickProcessT} from 'types/pick-process'
import {equalCard} from 'server/utils'

const defaultState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	gameType: null as 'stranger' | 'friend' | null,
	opponentId: '',
	gameState: null as GameState | null,
	availableActions: [] as Array<string>,
	selectedCard: null as CardT | null,
	openedModalId: null as string | null,
	pickProcess: null as PickProcessT | null,
}

const rootReducer = (state = defaultState, action: AnyAction) => {
	switch (action.type) {
		case 'SET_NAME':
			return {...state, playerName: action.playerName}
		case 'SET_PLAYER_INFO':
			return {
				...state,
				playerId: action.playerId,
				playerSecret: action.playerSecret,
			}
		case 'SET_GAME_TYPE':
			return {
				...state,
				gameType: action.gameType,
			}
		case 'GAME_STATE':
			const newState = {
				...state,
				opponentId: action.opponentId,
				gameState: action.gameState,
				availableActions: action.availableActions,
			}
			if (state.gameState?.turnPlayerId === action.gameState?.turnPlayerId)
				return newState
			return {
				...newState,
				selectedCard: null,
				openedModalId: null,
				pickProcess: null,
			}
		case 'GAME_END':
			return {
				...state,
				gameType: null,
				opponentId: '',
				gameState: null,
				availableActions: [],
			}
		case 'SET_SELECTED_CARD':
			if (state.pickProcess) return state
			return {
				...state,
				selectedCard: equalCard(action.payload, state.selectedCard)
					? null
					: action.payload,
			}
		case 'SET_OPENED_MODAL_ID':
			return {
				...state,
				openedModalId: action.payload,
			}
		case 'SET_PICK_PROCESS':
			return {
				...state,
				selectedCard: null,
				pickProcess: action.payload,
			}
		case 'UPDATE_PICK_PROCESS': {
			return {
				...state,
				pickProcess: {
					...state.pickProcess,
					pickedCards: action.payload,
				},
			}
		}
		default:
			return state
	}
}

export default rootReducer
