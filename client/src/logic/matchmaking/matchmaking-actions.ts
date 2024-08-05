import {actions} from '../../../../common/redux-actions'

export const matchmakingActions = actions(
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

export type MatchmakingAction = ReturnType<
	| typeof joinQueue
	| typeof createPrivateGame
	| typeof joinPrivateGame
	| typeof codeReceived
	| typeof leaveMatchmaking
	| typeof clearMatchmaking
	| typeof setCode
	| typeof invalidCode
	| typeof waitingForPlayer
>

export const joinQueue = () => ({
	type: matchmakingActions.JOIN_QUEUE,
})

export const createPrivateGame = () => ({
	type: matchmakingActions.CREATE_PRIVATE_GAME,
})

export const joinPrivateGame = () => ({
	type: matchmakingActions.JOIN_PRIVATE_GAME,
})

export const codeReceived = (code: string) => ({
	type: matchmakingActions.CODE_RECIEVED,
	payload: code,
})

export const leaveMatchmaking = () => ({
	type: matchmakingActions.LEAVE_MATCHMAKING,
})

export const clearMatchmaking = () => ({
	type: matchmakingActions.CLEAR_MATCHMAKING,
})

export const setCode = (gameCode: string | null) => ({
	type: matchmakingActions.SET_MATCHMAKING_CODE,
	payload: gameCode,
})

export const invalidCode = () => ({
	type: matchmakingActions.INVALID_CODE,
})

export const waitingForPlayer = () => ({
	type: matchmakingActions.WAITING_FOR_PLAYER,
})
