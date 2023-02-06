import {AnyAction} from 'redux'
import {MatchmakingStatusT} from './matchmaking-types'

type MatchmakingState = {
	status: MatchmakingStatusT
	code: string | null
	invalidCode: boolean
}

const defaultState: MatchmakingState = {
	status: null,
	code: null,
	invalidCode: false,
}

const matchmakingReducer = (
	state = defaultState,
	action: AnyAction
): MatchmakingState => {
	switch (action.type) {
		case 'RANDOM_MATCHMAKING':
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
		case 'CODE_RECEIVED':
			return {
				...state,
				code: action.payload,
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
				code: action.payload,
				status: 'loading',
			}
		case 'GAME_STATE':
		case 'LEAVE_MATCHMAKING':
			return {
				...state,
				code: null,
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
