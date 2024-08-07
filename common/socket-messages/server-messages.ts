import {PlayerId} from '../models/player-model'
import {Message, MessageTable, messages} from '../redux-actions'
import {PlayerDeckT} from '../types/deck'
import {
	GameEndOutcomeT,
	GameEndReasonT,
	GamePlayerEndOutcomeT,
	LocalGameState,
} from '../types/game-state'
import {Message as ChatMessage} from '../types/game-state'
import {PlayerInfo} from '../types/server-requests'

export const serverMessages = messages(
	'PLAYER_RECONNECTED',
	'INVALID_PLAYER',
	'PLAYER_INFO',
	'NEW_DECK',
	'NEW_MINECRAFT_NAME',
	'LOAD_UPDATES',
	'GAME_STATE_ON_RECONNECT',
	'OPPONENT_CONNECTION',
	'GAME_CRASH',
	'GAME_START',
	'GAME_END',
	'PRIVATE_GAME_TIMEOUT',
	'LEAVE_QUEUE_SUCCESS',
	'LEAVE_QUEUE_FAILURE',
	'CREATE_PRIVATE_GAME_SUCCESS',
	'CREATE_PRIVATE_GAME_FAILURE',
	'JOIN_PRIVATE_GAME_SUCCESS',
	'JOIN_PRIVATE_GAME_FAILURE',
	'JOIN_QUEUE_SUCCESS',
	'JOIN_QUEUE_FAILURE',
	'INVALID_CODE',
	'WAITING_FOR_PLAYER',
	'PRIVATE_GAME_CANCELLED',
	'GAME_OVER_STAT',
	'GAME_STATE',
	'CHAT_UPDATE',
)

export type ServerMessages = [
	{type: typeof serverMessages.PLAYER_RECONNECTED},
	{type: typeof serverMessages.INVALID_PLAYER},
	{type: typeof serverMessages.PLAYER_INFO; player: PlayerInfo},
	{type: typeof serverMessages.NEW_DECK; deck: PlayerDeckT},
	{type: typeof serverMessages.NEW_MINECRAFT_NAME; name: string},
	{
		type: typeof serverMessages.LOAD_UPDATES
		updates: Record<string, Array<string>>
	},
	{
		type: typeof serverMessages.GAME_STATE_ON_RECONNECT
		localGameState: LocalGameState | null
		order: PlayerId[]
	},
	{type: typeof serverMessages.OPPONENT_CONNECTION; isConnected: boolean},
	{type: typeof serverMessages.GAME_CRASH},
	{type: typeof serverMessages.GAME_START},
	{
		type: typeof serverMessages.GAME_END
		gameState: LocalGameState | null
		outcome: GamePlayerEndOutcomeT
		reason?: GameEndReasonT
	},
	{type: typeof serverMessages.PRIVATE_GAME_TIMEOUT},
	{type: typeof serverMessages.LEAVE_QUEUE_SUCCESS},
	{type: typeof serverMessages.LEAVE_QUEUE_FAILURE},
	{type: typeof serverMessages.CREATE_PRIVATE_GAME_SUCCESS; code: string},
	{type: typeof serverMessages.CREATE_PRIVATE_GAME_FAILURE},
	{type: typeof serverMessages.JOIN_PRIVATE_GAME_SUCCESS},
	{type: typeof serverMessages.JOIN_PRIVATE_GAME_FAILURE},
	{type: typeof serverMessages.JOIN_QUEUE_SUCCESS},
	{type: typeof serverMessages.JOIN_QUEUE_FAILURE},
	{type: typeof serverMessages.INVALID_CODE},
	{type: typeof serverMessages.WAITING_FOR_PLAYER},
	{type: typeof serverMessages.PRIVATE_GAME_CANCELLED},
	{
		type: typeof serverMessages.GAME_OVER_STAT
		outcome: GameEndOutcomeT
		won: boolean
	},
	{type: typeof serverMessages.GAME_STATE; localGameState: LocalGameState},
	{type: typeof serverMessages.CHAT_UPDATE; messages: Array<ChatMessage>},
]

export type ServerMessage = Message<ServerMessages>
export type ServerMessageTable = MessageTable<ServerMessages>
