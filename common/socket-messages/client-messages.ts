import {PlayerEntity} from '../entities'
import {PlayerId} from '../models/player-model'
import {Message, MessageTable, messages} from '../redux-messages'
import {PlayerDeckT} from '../types/deck'
import {AnyTurnActionData} from '../types/turn-action-data'

export const clientMessages = messages({
	GET_UPDATES: null,
	UPDATE_DECK: null,
	UPDATE_MINECRAFT_NAME: null,
	CREATE_PRIVATE_GAME: null,
	CANCEL_PRIVATE_GAME: null,
	SPECTATE_PRIVATE_GAME_QUEUE_LEAVE: null,
	JOIN_QUEUE: null,
	LEAVE_QUEUE: null,
	JOIN_PRIVATE_GAME: null,
	TURN_ACTION: null,
	FORFEIT: null,
	SPECTATOR_LEAVE: null,
	CHAT_MESSAGE: null,
})

export type ClientMessages = [
	{type: typeof clientMessages.GET_UPDATES},
	{type: typeof clientMessages.UPDATE_DECK; deck: PlayerDeckT},
	{type: typeof clientMessages.UPDATE_MINECRAFT_NAME; name: string},
	{type: typeof clientMessages.CREATE_PRIVATE_GAME},
	{type: typeof clientMessages.CANCEL_PRIVATE_GAME},
	{type: typeof clientMessages.SPECTATE_PRIVATE_GAME_QUEUE_LEAVE},
	{type: typeof clientMessages.JOIN_QUEUE},
	{type: typeof clientMessages.LEAVE_QUEUE},
	{type: typeof clientMessages.JOIN_PRIVATE_GAME; code: string},
	{
		type: typeof clientMessages.TURN_ACTION
		playerEntity: PlayerEntity
		action: AnyTurnActionData
	},
	{type: typeof clientMessages.FORFEIT},
	{type: typeof clientMessages.SPECTATOR_LEAVE},
	{type: typeof clientMessages.CHAT_MESSAGE; message: string},
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
