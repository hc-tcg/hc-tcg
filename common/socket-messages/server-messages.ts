import {PlayerId} from '../models/player-model'
import {Action, actions, ActionTable} from '../redux-actions'
import {PlayerDeckT} from '../types/deck'
import {
	GamePlayerEndOutcomeT,
	GameEndReasonT,
	LocalGameState,
} from '../types/game-state'

export const serverMessages = actions(
	'PLAYER_RECONNECTED',
	'INVALID_PLAYER',
	'PLAYER_INFO',
	'NEW_DECK',
	'NEW_MINECRAFT_NAME',
	'LOAD_UPDATES',
	'GAME_STATE_ON_RECONNECT',
	'OPPONENT_CONNECTION',
	'GAME_CRASH',
	'GAME_END',
	'PRIVATE_GAME_TMEOUT',
	'LEAVE_QUEUE_SUCCESS',
	'LEAVE_QUEUE_FAILURE',
	'CREATE_PRIVATE_GAME_SUCCESS',
	'CREATE_PRIVATE_GAME_FAILURE',
	'JOIN_PRIVATE_GAME_SUCCESS',
	'JOIN_PRIVATE_GAME_FAILURE',
	'JOIN_QUEUE_SUCCESS',
	'INVALID_CODE',
	'WAITING_FOR_PLAYER',
	'PRIVATE_GAME_CANCELLED',
)

export type ServerMessages = [
	{type: typeof serverMessages.PLAYER_RECONNECTED; payload: PlayerDeckT},
	{type: typeof serverMessages.INVALID_PLAYER},
	{type: typeof serverMessages.PLAYER_INFO},
	{type: typeof serverMessages.NEW_DECK; payload: PlayerDeckT},
	{type: typeof serverMessages.NEW_MINECRAFT_NAME; payload: string},
	{
		type: typeof serverMessages.LOAD_UPDATES
		payload: Record<string, Array<string>>
	},
	{
		type: typeof serverMessages.GAME_STATE_ON_RECONNECT
		payload: {
			localGameState: LocalGameState | null
			order: PlayerId[]
		}
	},
	{type: typeof serverMessages.OPPONENT_CONNECTION; payload: boolean},
	{type: typeof serverMessages.GAME_CRASH},
	{
		type: typeof serverMessages.GAME_END
		payload: {
			gameState: LocalGameState | null
			outcome: GamePlayerEndOutcomeT | null
			reason: GameEndReasonT | null
		}
	},
	{type: typeof serverMessages.PRIVATE_GAME_TMEOUT},
	{type: typeof serverMessages.LEAVE_QUEUE_SUCCESS},
	{type: typeof serverMessages.LEAVE_QUEUE_FAILURE},
	{type: typeof serverMessages.CREATE_PRIVATE_GAME_SUCCESS},
	{type: typeof serverMessages.CREATE_PRIVATE_GAME_FAILURE},
	{type: typeof serverMessages.JOIN_PRIVATE_GAME_SUCCESS},
	{type: typeof serverMessages.JOIN_PRIVATE_GAME_FAILURE},
	{type: typeof serverMessages.JOIN_QUEUE_SUCCESS},
	{type: typeof serverMessages.INVALID_CODE},
	{type: typeof serverMessages.WAITING_FOR_PLAYER},
	{type: typeof serverMessages.PRIVATE_GAME_CANCELLED},
]

export type ServerMessage = Action<ServerMessages>
export type ServerMessageTable = ActionTable<ServerMessages>
