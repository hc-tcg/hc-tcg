import {PlayerId} from '../models/player-model'
import {Action, actions, ActionTable} from '../redux-actions'
import {PlayerDeckT} from '../types/deck'
import {
	GamePlayerEndOutcomeT,
	GameEndReasonT,
	LocalGameState,
} from '../types/game-state'
import {PlayerInfo} from '../types/server-requests'

export const serverMessages = actions(
	'PLAYER_RECONNECTED',
	'INVALID_PLAYER',
	'PLAYER_CONNECTED',
	'PLAYER_INFO',
	'PLAYER_DISCONNECTED',
	'PLAYER_REMOVED',
	'NEW_DECK',
	'NEW_MINECRAFT_NAME',
	'LOAD_UPDATES',
	'GAME_STATE_ON_RECONNECT',
	'OPPONENT_CONNECTION',
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

const PayloadConstructors = () => ({
	playerReconnected,
	invalidPlayer,
	playerInfo,
	newDeck,
	newMinecraftName,
	loadUpdates,
	gameStateOnReconnect,
	opponentConnection,
	gameCrash,
	gameEnd,
	privateGameTimeout,
	leaveQueueSuccess,
	leaveQueueFailure,
	createPrivateGameSuccess,
	createPrivateGameFailure,
	joinPrivateGameSuccess,
	joinPrivateGameFailure,
	invalidCode,
	waitingForPlayer,
	privateGameCancelled,
})

export type ServerActions = ActionTable<typeof PayloadConstructors>
export type ServerMessage = Action<typeof PayloadConstructors>

export const playerReconnected = (playerDeck: PlayerDeckT) => ({
	type: serverMessages.PLAYER_RECONNECTED,
	payload: playerDeck,
})

export const invalidPlayer = () => ({
	type: serverMessages.INVALID_PLAYER,
})

export const playerInfo = (info: PlayerInfo) => ({
	type: serverMessages.PLAYER_INFO,
	payload: info,
})

export const newDeck = (deck: PlayerDeckT) => ({
	type: serverMessages.NEW_DECK,
	payload: deck,
})

export const newMinecraftName = (name: string) => ({
	type: serverMessages.NEW_MINECRAFT_NAME,
	payload: name,
})

export const loadUpdates = (updates: Record<string, string[]>) => ({
	type: serverMessages.LOAD_UPDATES,
	payload: updates,
})

type GameStateOnReconnectDefs = {
	localGameState: LocalGameState | null
	order: PlayerId[]
}

export const gameStateOnReconnect = (defs: GameStateOnReconnectDefs) => ({
	type: serverMessages.GAME_STATE_ON_RECONNECT,
	payload: defs,
})

export const opponentConnection = (opponentConnected: boolean) => ({
	type: serverMessages.OPPONENT_CONNECTION,
	payload: opponentConnected,
})

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
