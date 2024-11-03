import {PlayerEntity} from '../entities'
import {GameProps} from '../models/game-model'
import {Message, MessageTable, messages} from '../redux-messages'
import {GameMessage, GameStartupInformation} from '../routines/game'
import {Stats, User} from '../types/database'
import {Deck, Tag} from '../types/deck'
import {ChatMessage, LocalGameState} from '../types/game-state'
import {PlayerInfo} from '../types/server-requests'
import {AnyTurnActionData} from '../types/turn-action-data'

export const serverMessages = messages('server', {
	PLAYER_RECONNECTED: null,
	INVALID_PLAYER: null,
	PLAYER_INFO: null,
	NEW_DECK: null,
	NEW_MINECRAFT_NAME: null,
	LOAD_UPDATES: null,
	OPPONENT_CONNECTION: null,
	GAME_CRASH: null,
	GAME_START: null,
	GAME_END: null,
	GAME_TURN_ACTION: null,
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
	SPECTATE_PRIVATE_GAME_WAITING: null,
	SPECTATE_PRIVATE_GAME_START: null,
	INVALID_CODE: null,
	WAITING_FOR_PLAYER: null,
	PRIVATE_GAME_CANCELLED: null,
	GAME_OVER_STAT: null,
	GAME_STATE: null,
	GAME_RECONNECT_INFORMATION: null,
	CHAT_UPDATE: null,
	/**Postgres */
	AUTHENTICATED: null,
	AUTHENTICATION_FAIL: null,
	DECKS_RECIEVED: null,
	STATS_RECIEVED: null,
	DATABASE_FAILURE: null,
})

export type ServerMessages = [
	{
		type: typeof serverMessages.PLAYER_RECONNECTED
		game?: GameStartupInformation
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
		updates: Record<string, Array<string>>
	},
	{type: typeof serverMessages.OPPONENT_CONNECTION; isConnected: boolean},
	{type: typeof serverMessages.GAME_CRASH},
	{
		type: typeof serverMessages.GAME_START
		props: GameProps
		playerEntity: PlayerEntity
	},
	{
		type: typeof serverMessages.GAME_TURN_ACTION
		playerEntity: PlayerEntity
		action: AnyTurnActionData
		time: number
		/** A number approximating the game state, used to verify games are synced between the server and client. */
		gameStateHash: string
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
	{type: typeof serverMessages.SPECTATE_PRIVATE_GAME_WAITING},
	{
		type: typeof serverMessages.SPECTATE_PRIVATE_GAME_START
		game: GameStartupInformation
	},
	{type: typeof serverMessages.INVALID_CODE},
	{type: typeof serverMessages.WAITING_FOR_PLAYER},
	{type: typeof serverMessages.PRIVATE_GAME_CANCELLED},
	{type: typeof serverMessages.GAME_STATE; localGameState: LocalGameState},
	{
		type: typeof serverMessages.GAME_RECONNECT_INFORMATION
		history: Array<GameMessage>
		timer: {
			turnRemaining: number
			turnStartTime: number
		}
	},
	{type: typeof serverMessages.CHAT_UPDATE; messages: Array<ChatMessage>},
	{type: typeof serverMessages.AUTHENTICATED; user: User},
	{type: typeof serverMessages.AUTHENTICATION_FAIL},
	{
		type: typeof serverMessages.DECKS_RECIEVED
		decks: Array<Deck>
		tags: Array<Tag>
		newActiveDeck?: Deck
	},
	{type: typeof serverMessages.STATS_RECIEVED; stats: Stats},
	{type: typeof serverMessages.DATABASE_FAILURE; error: string | undefined},
]

export type ServerMessage = Message<ServerMessages>
export type ServerMessageTable = MessageTable<ServerMessages>
