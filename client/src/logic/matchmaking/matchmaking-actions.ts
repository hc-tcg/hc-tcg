import {Message, messages, MessageTable} from '../../../../common/redux-actions'

export const matchmakingActions = messages(
	'JOIN_QUEUE',
	'JOIN_QUEUE_FAILURE',
	'CREATE_PRIVATE_GAME',
	'JOIN_PRIVATE_GAME',
	'CODE_RECIEVED',
	'LEAVE_MATCHMAKING',
	'CLEAR_MATCHMAKING',
	'SET_MATCHMAKING_CODE',
	'INVALID_CODE',
	'WAITING_FOR_PLAYER',
)

type MatchmakingActions = [
	{type: typeof matchmakingActions.JOIN_QUEUE},
	{type: typeof matchmakingActions.CREATE_PRIVATE_GAME},
	{type: typeof matchmakingActions.JOIN_PRIVATE_GAME},
	{type: typeof matchmakingActions.CODE_RECIEVED; code: string},
	{type: typeof matchmakingActions.LEAVE_MATCHMAKING},
	{type: typeof matchmakingActions.CLEAR_MATCHMAKING},
	{
		type: typeof matchmakingActions.SET_MATCHMAKING_CODE
		code: string
	},
	{type: typeof matchmakingActions.INVALID_CODE},
	{type: typeof matchmakingActions.WAITING_FOR_PLAYER},
]

export type MatchmakingMessage = Message<MatchmakingActions>
export type MatchmakingMessageTable = MessageTable<MatchmakingActions>
