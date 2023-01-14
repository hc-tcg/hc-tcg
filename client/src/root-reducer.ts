import {AnyAction} from 'redux'
import {GameState} from 'types/game-state'

const defaultState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	gameType: null as 'stranger' | 'friend' | null,
	opponentId: '',
	gameState: null as GameState | null,
	availableActions: [] as Array<string>,
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
		default:
			return state
	}
}

export default rootReducer
