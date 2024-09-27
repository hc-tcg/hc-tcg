import {LocalMessage, localMessages} from 'logic/messages'
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
	action: LocalMessage,
): MatchmakingState => {
	switch (action.type) {
		case localMessages.MATCHMAKING_QUEUE_JOIN:
			return {
				...state,
				status: 'random_waiting',
			}
		case localMessages.MATCHMAKING_BOSS_GAME_CREATE:
		case localMessages.MATCHMAKING_PRIVATE_GAME_CREATE:
			return {
				...state,
				status: 'loading',
			}
		case localMessages.MATCHMAKING_PRIVATE_GAME_JOIN:
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: false,
			}
		case localMessages.MATCHMAKING_WAITING_FOR_PLAYER:
			return {
				...state,
				status: 'waiting_for_player',
			}
		case localMessages.MATCHMAKING_WAITING_FOR_PLAYER_AS_SPECTATOR:
			return {
				...state,
				status: 'waiting_for_player_as_spectator',
			}
		case localMessages.MATCHMAKING_CODE_RECIEVED:
			return {
				...state,
				gameCode: action.gameCode,
				spectatorCode: action.spectatorCode,
				status: 'private_waiting',
			}
		case localMessages.MATCHMAKING_CODE_INVALID:
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: true,
			}
		case localMessages.MATCHMAKING_CODE_SET:
			return {
				...state,
				status: 'loading',
			}
		case localMessages.DISCONNECT:
		case localMessages.MATCHMAKING_LEAVE:
			return {
				...state,
				gameCode: null,
				spectatorCode: null,
				status: null,
				invalidCode: false,
			}
		case localMessages.MATCHMAKING_CLEAR:
			return {
				...state,
				gameCode: null,
				spectatorCode: null,
				status: null,
				invalidCode: false,
			}
		case localMessages.GAME_START:
			return {
				...state,
				status: 'starting',
			}
		default:
			return state
	}
}

export default matchmakingReducer
