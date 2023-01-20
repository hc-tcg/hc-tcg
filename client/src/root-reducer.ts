import {AnyAction} from 'redux'
import {GameState, CardT} from 'types/game-state'
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
	pickProcess: null as string | null,
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
			return {
				...state,
				opponentId: action.opponentId,
				gameState: action.gameState,
				availableActions: action.availableActions,
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
				pickProcess: action.payload,
			}
		default:
			return state
	}
}

export default rootReducer
