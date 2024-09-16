import {PlayerId} from '../models/player-model'
import {Message, MessageTable, messages} from '../redux-messages'
import {PlayerDeckT} from '../types/deck'
import {
	GameEndOutcomeT,
	GameEndReasonT,
	GamePlayerEndOutcomeT,
	LocalGameState,
} from '../types/game-state'
import {Message as ChatMessage} from '../types/game-state'
import {PlayerInfo} from '../types/server-requests'

export const serverMessages = messages({
	PLAYER_RECONNECTED: null,
	INVALID_PLAYER: null,
	PLAYER_INFO: null,
	NEW_DECK: null,
	NEW_MINECRAFT_NAME: null,
	LOAD_UPDATES: null,
	GAME_STATE_ON_RECONNECT: null,
	OPPONENT_CONNECTION: null,
	GAME_CRASH: null,
	GAME_START: null,
	GAME_END: null,
	PRIVATE_GAME_TIMEOUT: null,
	LEAVE_QUEUE_SUCCESS: null,
	LEAVE_QUEUE_FAILURE: null,
	CREATE_PRIVATE_GAME_SUCCESS: null,
	CREATE_PRIVATE_GAME_FAILURE: null,
	JOIN_PRIVATE_GAME_SUCCESS: null,
	JOIN_PRIVATE_GAME_FAILURE: null,
	JOIN_QUEUE_SUCCESS: null,
	JOIN_QUEUE_FAILURE: null,
	INVALID_CODE: null,
	WAITING_FOR_PLAYER: null,
	PRIVATE_GAME_CANCELLED: null,
	GAME_OVER_STAT: null,
	GAME_STATE: null,
	CHAT_UPDATE: null,
})

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
