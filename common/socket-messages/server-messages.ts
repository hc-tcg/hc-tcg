import {Appearance} from '../cosmetics/types'
import {Message, MessageTable, messages} from '../redux-messages'
import {EarnedAchievement} from '../types/achievements'
import {RematchData} from '../types/app'
import {
	AchievementData,
	GameHistory,
	PlayerStats,
	User,
} from '../types/database'
import {ApiDeck, Deck, Tag} from '../types/deck'
import {GameOutcome, LocalGameState} from '../types/game-state'
import {Message as ChatMessage} from '../types/game-state'
import {PlayerInfo, Update} from '../types/server-requests'

export const serverMessages = messages('serverMessages', {
	PLAYER_RECONNECTED: null,
	INVALID_PLAYER: null,
	PLAYER_INFO: null,
	NEW_DECK: null,
	LOAD_UPDATES: null,
	OPPONENT_CONNECTION: null,
	GAME_START: null,
	GAME_END: null,
	ACHIEVEMENT_COMPLETE: null,
	PRIVATE_GAME_TIMEOUT: null,
	LEAVE_QUEUE_SUCCESS: null,
	LEAVE_QUEUE_FAILURE: null,
	CREATE_BOSS_GAME_SUCCESS: null,
	CREATE_BOSS_GAME_FAILURE: null,
	CREATE_PRIVATE_GAME_SUCCESS: null,
	CREATE_PRIVATE_GAME_FAILURE: null,
	JOIN_PRIVATE_GAME_SUCCESS: null,
	JOIN_PRIVATE_GAME_FAILURE: null,
	JOIN_PUBLIC_QUEUE_SUCCESS: null,
	JOIN_PUBLIC_QUEUE_FAILURE: null,
	SPECTATE_PRIVATE_GAME_START: null,
	SPECTATE_PRIVATE_GAME_WAITING: null,
	SPECTATE_PRIVATE_GAME_FAILURE: null,
	INVALID_CODE: null,
	PRIVATE_GAME_CANCELLED: null,
	GAME_OVER_STAT: null,
	GAME_STATE: null,
	CHAT_UPDATE: null,
	COSMETICS_INVALID: null,
	COSMETICS_UPDATE: null,
	INVALID_REPLAY: null,
	REPLAY_OVERVIEW_RECIEVED: null,
	// Rematch
	SEND_REMATCH: null,
	REMATCH_REQUESTED: null,
	REMATCH_DENIED: null,
	CREATE_REMATCH_SUCCESS: null,
	CREATE_REMATCH_FAILURE: null,
	/**Postgres */
	AUTHENTICATED: null,
	AUTHENTICATION_FAIL: null,
	DECKS_RECIEVED: null,
	AFTER_GAME_INFO: null,
	CURRENT_IMPORT_RECIEVED: null,
	DATABASE_FAILURE: null,
	TOAST_SEND: null,
})

export type ServerMessages = [
	{
		type: typeof serverMessages.PLAYER_RECONNECTED
		game?: LocalGameState
		spectatorCode?: string
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
	{
		type: typeof serverMessages.LOAD_UPDATES
		updates: Array<Update>
	},
	{type: typeof serverMessages.OPPONENT_CONNECTION; isConnected: boolean},
	{type: typeof serverMessages.GAME_START; spectatorCode?: string},
	{
		type: typeof serverMessages.GAME_END
		gameState: LocalGameState | null
		outcome: GameOutcome
		earnedAchievements: Array<EarnedAchievement> | null
		gameEndTime: number
	},
	{
		type: typeof serverMessages.ACHIEVEMENT_COMPLETE
		achievement: EarnedAchievement
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
	{type: typeof serverMessages.JOIN_PUBLIC_QUEUE_SUCCESS},
	{type: typeof serverMessages.JOIN_PUBLIC_QUEUE_FAILURE},
	{
		type: typeof serverMessages.SPECTATE_PRIVATE_GAME_START
		localGameState: LocalGameState
	},
	{type: typeof serverMessages.SPECTATE_PRIVATE_GAME_WAITING},
	{type: typeof serverMessages.SPECTATE_PRIVATE_GAME_FAILURE},
	{type: typeof serverMessages.INVALID_CODE},
	{type: typeof serverMessages.PRIVATE_GAME_CANCELLED},
	{
		type: typeof serverMessages.GAME_OVER_STAT
		outcome: GameOutcome
		won: boolean
	},
	{type: typeof serverMessages.GAME_STATE; localGameState: LocalGameState},
	{type: typeof serverMessages.CHAT_UPDATE; messages: Array<ChatMessage>},
	{type: typeof serverMessages.AUTHENTICATED; user: User},
	{type: typeof serverMessages.AUTHENTICATION_FAIL},
	{
		type: typeof serverMessages.DECKS_RECIEVED
		decks: Array<Deck>
		tags: Array<Tag>
		newActiveDeck?: Deck
	},
	{
		type: typeof serverMessages.AFTER_GAME_INFO
		stats: PlayerStats
		gameHistory: Array<GameHistory>
		achievements: AchievementData
	},
	{type: typeof serverMessages.CURRENT_IMPORT_RECIEVED; deck: ApiDeck | null},
	{type: typeof serverMessages.DATABASE_FAILURE; error: string | undefined},
	{type: typeof serverMessages.COSMETICS_INVALID},
	{type: typeof serverMessages.COSMETICS_UPDATE; appearance: Appearance},
	{type: typeof serverMessages.INVALID_REPLAY},
	{
		type: typeof serverMessages.REPLAY_OVERVIEW_RECIEVED
		battleLog: Array<ChatMessage>
	},
	{type: typeof serverMessages.SEND_REMATCH; rematch: RematchData | null},
	{type: typeof serverMessages.REMATCH_REQUESTED; opponentName: string},
	{type: typeof serverMessages.REMATCH_DENIED},
	{type: typeof serverMessages.CREATE_REMATCH_SUCCESS},
	{type: typeof serverMessages.CREATE_REMATCH_FAILURE},
	{
		type: typeof serverMessages.TOAST_SEND
		title: string
		description: string
		image?: string
	},
]

export type ServerMessage = Message<ServerMessages>
export type ServerMessageTable = MessageTable<ServerMessages>
