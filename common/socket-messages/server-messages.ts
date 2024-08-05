import {actions} from '../redux-actions'
import {
	GamePlayerEndOutcomeT,
	GameEndReasonT,
	LocalGameState,
} from '../types/game-state'

export type ServerMessage = ReturnType<
	| typeof gameCrash
	| typeof gameEnd
	| typeof privateGameTimeout
	| typeof leaveQueueSuccess
	| typeof leaveQueueFailure
	| typeof createPrivateGameSuccess
	| typeof createPrivateGameFailure
>

export const serverMessages = actions(
	'GAME_CRASH',
	'GAME_END',
	'PRIVATE_GAME_TIMEOUT',
	'JOIN_QUEUE_SUCCESS',
	'LEAVE_QUEUE_SUCCESS',
	'LEAVE_QUEUE_FAILURE',
	'CREATE_PRIVATE_GAME_SUCCESS',
	'CREATE_PRIVATE_GAME_FAILURE',
	'JOIN_PRIVATE_GAME_SUCCESS',
	'JOIN_PRIVATE_GAME_FAILURE',
	'INVALID_CODE',
	'WAITING_FOR_PLAYER',
	'PRIVATE_GAME_CANCELLED',
)

export const gameCrash = () => ({
	type: serverMessages.GAME_CRASH,
})

export type GameEndDefs = {
	gameState: LocalGameState | null
	outcome: GamePlayerEndOutcomeT | null
	reason: GameEndReasonT | null
}

export const gameEnd = (defs: GameEndDefs) => ({
	type: serverMessages.GAME_END,
	payoload: {...defs},
})

export const privateGameTimeout = () => ({
	type: serverMessages.PRIVATE_GAME_TIMEOUT,
})

export const joinQueueSuccess = () => ({
	type: serverMessages.JOIN_QUEUE_SUCCESS,
})

export const leaveQueueSuccess = () => ({
	type: serverMessages.LEAVE_QUEUE_SUCCESS,
})

export const leaveQueueFailure = () => ({
	type: serverMessages.LEAVE_QUEUE_FAILURE,
})

export const createPrivateGameSuccess = (gameCode: string) => ({
	type: serverMessages.CREATE_PRIVATE_GAME_SUCCESS,
	payload: gameCode,
})

export const createPrivateGameFailure = () => ({
	type: serverMessages.CREATE_PRIVATE_GAME_FAILURE,
})

export const joinPrivateGameSuccess = () => ({
	type: serverMessages.JOIN_PRIVATE_GAME_SUCCESS,
})

export const joinPrivateGameFailure = () => ({
	type: serverMessages.JOIN_PRIVATE_GAME_FAILURE,
})

export const invalidCode = () => ({
	type: serverMessages.INVALID_CODE,
})

export const waitingForPlayer = () => ({
	type: serverMessages.WAITING_FOR_PLAYER,
})

export const privateGameCancelled = () => ({
	type: serverMessages.PRIVATE_GAME_CANCELLED,
})
