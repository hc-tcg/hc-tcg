import {Message, MessageTable, messages} from '../redux-messages'
import {Stats, User} from '../types/database'
import {ApiDeck, Deck, Tag} from '../types/deck'
import {GameOutcome, LocalGameState} from '../types/game-state'
import {Message as ChatMessage} from '../types/game-state'
import {PlayerInfo, Update} from '../types/server-requests'

export const serverMessages = messages('serverMessages', {
	PLAYER_RECONNECTED: null,
	INVALID_PLAYER: null,
	PLAYER_INFO: null,
	NEW_DECK: null,
	NEW_MINECRAFT_NAME: null,
	LOAD_UPDATES: null,
	OPPONENT_CONNECTION: null,
	GAME_START: null,
	GAME_END: null,
	PRIVATE_GAME_TIMEOUT: null,
	LEAVE_QUEUE_SUCCESS: null,
	LEAVE_QUEUE_FAILURE: null,
	CREATE_BOSS_GAME_SUCCESS: null,
	CREATE_BOSS_GAME_FAILURE: null,
	CREATE_PRIVATE_GAME_SUCCESS: null,
	CREATE_PRIVATE_GAME_FAILURE: null,
	JOIN_PRIVATE_GAME_SUCCESS: null,
	JOIN_PRIVATE_GAME_FAILURE: null,
	JOIN_QUEUE_SUCCESS: null,
	JOIN_QUEUE_FAILURE: null,
	SPECTATE_PRIVATE_GAME_START: null,
	SPECTATE_PRIVATE_GAME_WAITING: null,
	INVALID_CODE: null,
	WAITING_FOR_PLAYER: null,
	PRIVATE_GAME_CANCELLED: null,
	GAME_OVER_STAT: null,
	GAME_STATE: null,
	CHAT_UPDATE: null,
	/**Postgres */
	NO_DATABASE_CONNECTION: null,
	AUTHENTICATED: null,
	AUTHENTICATION_FAIL: null,
	DECKS_RECIEVED: null,
	STATS_RECIEVED: null,
	CURRENT_IMPORT_RECIEVED: null,
	DATABASE_FAILURE: null,
})

export type ServerMessages = [
	{
		type: typeof serverMessages.PLAYER_RECONNECTED
		game?: LocalGameState
		messages?: Array<ChatMessage>
	},
	{type: typeof serverMessages.INVALID_PLAYER},
	{
		type: typeof serverMessages.PLAYER_INFO
		player: PlayerInfo
		/** The game is the player is currently in a game */
		game?: LocalGameState
	},
	{type: typeof serverMessages.NEW_DECK; deck: Deck},
	{type: typeof serverMessages.NEW_MINECRAFT_NAME; name: string},
	{
		type: typeof serverMessages.LOAD_UPDATES
		updates: Array<Update>
	},
	{type: typeof serverMessages.OPPONENT_CONNECTION; isConnected: boolean},
	{type: typeof serverMessages.GAME_START},
	{
		type: typeof serverMessages.GAME_END
		gameState: LocalGameState | null
		outcome: GameOutcome
	},
	{type: typeof serverMessages.PRIVATE_GAME_TIMEOUT},
	{type: typeof serverMessages.LEAVE_QUEUE_SUCCESS},
	{type: typeof serverMessages.LEAVE_QUEUE_FAILURE},
	{type: typeof serverMessages.CREATE_BOSS_GAME_SUCCESS},
	{type: typeof serverMessages.CREATE_BOSS_GAME_FAILURE},
	{
		type: typeof serverMessages.CREATE_PRIVATE_GAME_SUCCESS
		gameCode: string
		spectatorCode: string
	},
	{type: typeof serverMessages.CREATE_PRIVATE_GAME_FAILURE},
	{type: typeof serverMessages.JOIN_PRIVATE_GAME_SUCCESS},
	{type: typeof serverMessages.JOIN_PRIVATE_GAME_FAILURE},
	{type: typeof serverMessages.JOIN_QUEUE_SUCCESS},
	{type: typeof serverMessages.JOIN_QUEUE_FAILURE},
	{
		type: typeof serverMessages.SPECTATE_PRIVATE_GAME_START
		localGameState: LocalGameState
	},
	{type: typeof serverMessages.SPECTATE_PRIVATE_GAME_WAITING},
	{type: typeof serverMessages.INVALID_CODE},
	{type: typeof serverMessages.WAITING_FOR_PLAYER},
	{type: typeof serverMessages.PRIVATE_GAME_CANCELLED},
	{
		type: typeof serverMessages.GAME_OVER_STAT
		outcome: GameOutcome
		won: boolean
	},
	{type: typeof serverMessages.GAME_STATE; localGameState: LocalGameState},
	{type: typeof serverMessages.CHAT_UPDATE; messages: Array<ChatMessage>},
	{type: typeof serverMessages.NO_DATABASE_CONNECTION},
	{type: typeof serverMessages.AUTHENTICATED; user: User},
	{type: typeof serverMessages.AUTHENTICATION_FAIL},
	{
		type: typeof serverMessages.DECKS_RECIEVED
		decks: Array<Deck>
		tags: Array<Tag>
		newActiveDeck?: Deck
	},
	{type: typeof serverMessages.STATS_RECIEVED; stats: Stats},
	{type: typeof serverMessages.CURRENT_IMPORT_RECIEVED; deck: ApiDeck | null},
	{type: typeof serverMessages.DATABASE_FAILURE; error: string | undefined},
]

export type ServerMessage = Message<ServerMessages>
export type ServerMessageTable = MessageTable<ServerMessages>
