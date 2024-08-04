import {AnyAction} from 'redux'
import {MatchmakingStatus} from './matchmaking-types'

type MatchmakingState = {
	status: MatchmakingStatus
	gameCode: string | null
	spectatorCode: string | null
	invalidCode: boolean
}

const defaultState: MatchmakingState = {
	status: null,
	gameCode: null,
	spectatorCode: null,
	invalidCode: false,
}

const matchmakingReducer = (
	state = defaultState,
	action: AnyAction,
): MatchmakingState => {
	switch (action.type) {
		case 'JOIN_QUEUE':
			return {
				...state,
				status: 'random_waiting',
			}
		case 'CREATE_PRIVATE_GAME':
			return {
				...state,
				status: 'loading',
			}
		case 'JOIN_PRIVATE_GAME':
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: false,
			}
		case 'WAITING_FOR_PLAYER':
			return {
				...state,
				status: 'waiting_for_player',
			}
		case 'CODE_RECEIVED':
			return {
				...state,
				gameCode: action.payload.gameCode,
				spectatorCode: action.payload.spectatorCode,
				status: 'private_waiting',
			}
		case 'INVALID_CODE':
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: true,
			}
		case 'SET_MATCHMAKING_CODE':
			return {
				...state,
				gameCode: action.payload.gameCode,
				spectatorCode: action.payload.spectatorCode,
				status: 'loading',
			}
		case 'DISCONNECT':
		case 'GAME_STATE':
		case 'LEAVE_MATCHMAKING':
			return {
				...state,
				gameCode: null,
				spectatorCode: null,
				status: null,
				invalidCode: false,
			}
		case 'CLEAR_MATCHMAKING':
			return {
				...state,
				gameCode: null,
				spectatorCode: null,
				status: null,
				invalidCode: false,
			}
		case 'GAME_START':
			return {
				...state,
				status: 'starting',
			}
		default:
			return state
	}
}

export default matchmakingReducer
