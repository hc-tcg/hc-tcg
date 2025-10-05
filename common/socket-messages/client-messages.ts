import {Cosmetic} from '../cosmetics/types'
import {PlayerEntity} from '../entities'
import {PlayerId} from '../models/player-model'
import {Message, MessageTable, messages} from '../redux-messages'
import {RematchData} from '../types/app'
import {Deck, Tag} from '../types/deck'
import {AnyTurnActionData} from '../types/turn-action-data'

export const clientMessages = messages('clientMessages', {
	GET_UPDATES: null,
	SELECT_DECK: null,
	JOIN_PUBLIC_QUEUE: null,
	LEAVE_PUBLIC_QUEUE: null,
	JOIN_PRIVATE_QUEUE: null,
	SPECTATE_PRIVATE_GAME: null,
	LEAVE_PRIVATE_QUEUE: null,
	CREATE_PRIVATE_GAME: null,
	CANCEL_PRIVATE_GAME: null,
	CREATE_BOSS_GAME: null,
	CREATE_REMATCH_GAME: null,
	CREATE_REPLAY_GAME: null,
	LEAVE_REMATCH_GAME: null,
	CANCEL_REMATCH: null,
	REPLAY_OVERVIEW: null,
	TURN_ACTION: null,
	FORFEIT: null,
	SPECTATOR_LEAVE: null,
	CHAT_MESSAGE: null,
	/**Postgres */
	UPDATE_USERNAME: null,
	UPDATE_MINECRAFT_NAME: null,
	GET_DECKS: null,
	INSERT_DECK: null,
	EXPORT_DECK: null,
	GRAB_CURRENT_IMPORT: null,
	MAKE_INFO_PUBLIC: null,
	INSERT_DECKS: null,
	IMPORT_DECK: null,
	UPDATE_DECK: null,
	DELETE_DECK: null,
	DELETE_TAG: null,
	SET_COSMETIC: null,
	RESET_SECRET: null,
})

export type ClientMessages = [
	{type: typeof clientMessages.GET_UPDATES},
	{type: typeof clientMessages.UPDATE_USERNAME; name: string},
	{type: typeof clientMessages.UPDATE_MINECRAFT_NAME; name: string},
	{
		type: typeof clientMessages.JOIN_PUBLIC_QUEUE
		databaseConnected: true
		activeDeckCode: string
	},
	{
		type: typeof clientMessages.JOIN_PUBLIC_QUEUE
		databaseConnected: false
		activeDeck: Deck
	},
	{type: typeof clientMessages.LEAVE_PUBLIC_QUEUE},
	{
		type: typeof clientMessages.JOIN_PRIVATE_QUEUE
		databaseConnected: true
		activeDeckCode: string
		code: string
	},
	{
		type: typeof clientMessages.JOIN_PRIVATE_QUEUE
		databaseConnected: false
		activeDeck: Deck
		code: string
	},
	{
		type: typeof clientMessages.SPECTATE_PRIVATE_GAME
		code: string
	},
	{type: typeof clientMessages.LEAVE_PRIVATE_QUEUE},
	{
		type: typeof clientMessages.CREATE_BOSS_GAME
		databaseConnected: true
		activeDeckCode: string
	},
	{
		type: typeof clientMessages.CREATE_BOSS_GAME
		databaseConnected: false
		activeDeck: Deck
	},
	{
		type: typeof clientMessages.CREATE_PRIVATE_GAME
		databaseConnected: true
		activeDeckCode: string
	},
	{
		type: typeof clientMessages.CREATE_PRIVATE_GAME
		databaseConnected: false
		activeDeck: Deck
	},
	{type: typeof clientMessages.CANCEL_PRIVATE_GAME},
	{
		type: typeof clientMessages.CREATE_REPLAY_GAME
		id: number
		uuid: string
	},
	{
		type: typeof clientMessages.CREATE_REMATCH_GAME
		databaseConnected: true
		activeDeckCode: string
		opponentId: string
		playerScore: number
		opponentScore: number
		spectatorCode: string | null
	},
	{
		type: typeof clientMessages.CREATE_REMATCH_GAME
		databaseConnected: false
		activeDeck: Deck
		opponentId: string
		playerScore: number
		opponentScore: number
		spectatorCode: string | null
	},
	{type: typeof clientMessages.LEAVE_REMATCH_GAME},
	{
		type: typeof clientMessages.TURN_ACTION
		playerEntity: PlayerEntity
		action: AnyTurnActionData
	},
	{type: typeof clientMessages.SPECTATOR_LEAVE},
	{type: typeof clientMessages.CHAT_MESSAGE; message: string},
	{type: typeof clientMessages.GET_DECKS; newActiveDeck?: string},
	{
		type: typeof clientMessages.INSERT_DECK
		deck: Deck
		newActiveDeck?: string
	},
	{
		type: typeof clientMessages.UPDATE_DECK
		deck: Deck
		newActiveDeck?: string
	},
	{
		type: typeof clientMessages.INSERT_DECKS
		decks: Array<Deck>
		newActiveDeck?: string
	},
	{
		type: typeof clientMessages.IMPORT_DECK
		code: string
		newActiveDeck?: boolean
		newName: string
		newIcon: string
		newIconType: string
	},
	{
		type: typeof clientMessages.EXPORT_DECK
		code: string
	},
	{type: typeof clientMessages.GRAB_CURRENT_IMPORT; code: string | null},
	{
		type: typeof clientMessages.MAKE_INFO_PUBLIC
		code: string
		public: boolean
	},
	{type: typeof clientMessages.DELETE_DECK; deck: Deck},
	{type: typeof clientMessages.DELETE_TAG; tag: Tag},
	{type: typeof clientMessages.SET_COSMETIC; cosmetic: Cosmetic['id']},
	{type: typeof clientMessages.REPLAY_OVERVIEW; id: number},
	{type: typeof clientMessages.CANCEL_REMATCH; rematch: RematchData},
	{type: typeof clientMessages.RESET_SECRET},
]

export type ClientMessage = Message<ClientMessages>
export type ClientMessageTable = MessageTable<ClientMessages>

export type RecievedClientMessage<
	T extends ClientMessage['type'] = ClientMessage['type'],
> = {
	type: T
	playerId: PlayerId
	playerSecret: string
	payload: ClientMessageTable[T]
}
