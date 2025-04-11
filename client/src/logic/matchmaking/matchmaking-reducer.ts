import {LocalMessage, localMessages} from 'logic/messages'
import {MatchmakingStatus} from './matchmaking-types'

type MatchmakingState = {
	status: MatchmakingStatus
	gameCode: string | null
	spectatorCode: string | null
	selectedBossType: 'evilx' | 'new' | undefined
}

const defaultState: MatchmakingState = {
	status: null,
	gameCode: null,
	spectatorCode: null,
	selectedBossType: undefined,
}

const matchmakingReducer = (
	state = defaultState,
	action: LocalMessage,
): MatchmakingState => {
	switch (action.type) {
		case localMessages.MATCHMAKING_JOIN_PUBLIC_QUEUE:
		case localMessages.MATCHMAKING_CREATE_PRIVATE_GAME:
			return {
				...state,
				status: 'joining_queue',
			}
		case localMessages.MATCHMAKING_JOIN_PRIVATE_QUEUE:
			return {
				...state,
				status: 'joining_queue',
				gameCode: action.code,
			}
		case localMessages.MATCHMAKING_SPECTATE_PRIVATE_GAME:
			return {
				...state,
				status: 'joining_queue',
				spectatorCode: action.code,
			}
		case localMessages.MATCHMAKING_JOIN_QUEUE_SUCCESS:
			return {
				...state,
				status: 'in_queue',
			}
		case localMessages.MATCHMAKING_CREATE_GAME_SUCCESS:
			return {
				...state,
				status: 'in_queue',
				gameCode: action.gameCode,
				spectatorCode: action.spectatorCode,
			}
		case localMessages.MATCHMAKING_REMATCH:
			return {
				...state,
				status: 'joining_queue',
			}
		case localMessages.DISCONNECT:
		case localMessages.GAME_END:
		case localMessages.MATCHMAKING_LEAVE:
			return {
				...state,
				status: null,
				gameCode: null,
				spectatorCode: null,
				selectedBossType: undefined,
			}
		case localMessages.GAME_START:
			return {
				...state,
				status: 'in_game',
			}
		case localMessages.MATCHMAKING_CREATE_BOSS_GAME:
			return {
				...state,
				status: 'joining_queue',
				selectedBossType: action.bossType,
			}
		default:
			return state
	}
}

export default matchmakingReducer
