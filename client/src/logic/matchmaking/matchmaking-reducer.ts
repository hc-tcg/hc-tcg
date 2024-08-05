import {gameActions, GameMessage} from 'logic/game/game-actions'
import {matchmakingActions, MatchmakingMessage} from './matchmaking-actions'
import {MatchmakingStatus} from './matchmaking-types'
import {sessionActions, SessionMessage} from 'logic/session/session-actions'

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
	action: MatchmakingMessage | SessionMessage | GameMessage,
): MatchmakingState => {
	switch (action.type) {
		case matchmakingActions.JOIN_QUEUE:
			return {
				...state,
				status: 'random_waiting',
			}
		case matchmakingActions.CREATE_PRIVATE_GAME:
			return {
				...state,
				status: 'loading',
			}
		case matchmakingActions.JOIN_PRIVATE_GAME:
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: false,
			}
		case matchmakingActions.WAITING_FOR_PLAYER:
			return {
				...state,
				status: 'waiting_for_player',
			}
		case matchmakingActions.CODE_RECIEVED:
			return {
				...state,
				code: action.code,
				status: 'private_waiting',
			}
		case matchmakingActions.INVALID_CODE:
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: true,
			}
		case matchmakingActions.SET_MATCHMAKING_CODE:
			return {
				...state,
				code: action.code,
				status: 'loading',
			}
		case sessionActions.DISCONNECT:
		case matchmakingActions.LEAVE_MATCHMAKING:
			return {
				...state,
				code: null,
				status: null,
				invalidCode: false,
			}
		case matchmakingActions.CLEAR_MATCHMAKING:
			return {
				...state,
				code: null,
				status: null,
				invalidCode: false,
			}
		case gameActions.GAME_START:
			return {
				...state,
				status: 'starting',
			}
		default:
			return state
	}
}

export default matchmakingReducer
