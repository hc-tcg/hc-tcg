import {MatchmakingStatus} from './matchmaking-types'
import {Action, actions} from 'logic/actions'

type MatchmakingState = {
	status: MatchmakingStatus
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
	action: Action,
): MatchmakingState => {
	switch (action.type) {
		case actions.MATCHMAKING_JOIN_QUEUE:
			return {
				...state,
				status: 'random_waiting',
			}
		case actions.CREATE_PRIVATE_GAME:
			return {
				...state,
				status: 'loading',
			}
		case actions.JOIN_PRIVATE_GAME:
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: false,
			}
		case actions.WAITING_FOR_PLAYER:
			return {
				...state,
				status: 'waiting_for_player',
			}
		case actions.CODE_RECIEVED:
			return {
				...state,
				code: action.code,
				status: 'private_waiting',
			}
		case actions.INVALID_CODE:
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: true,
			}
		case actions.SET_MATCHMAKING_CODE:
			return {
				...state,
				code: action.code,
				status: 'loading',
			}
		case actions.DISCONNECT:
		case actions.LEAVE_MATCHMAKING:
			return {
				...state,
				code: null,
				status: null,
				invalidCode: false,
			}
		case actions.CLEAR_MATCHMAKING:
			return {
				...state,
				code: null,
				status: null,
				invalidCode: false,
			}
		case actions.GAME_START:
			return {
				...state,
				status: 'starting',
			}
		default:
			return state
	}
}

export default matchmakingReducer
