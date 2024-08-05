import {PlayerEntity} from '../entities'
import {Message, MessageTable, messages} from '../redux-actions'
import {PlayerDeckT} from '../types/deck'

export const clientMessages = messages(
	'GET_UPDATES',
	'UPDATE_DECK',
	'UPDATE_MINECRAFT_NAME',
	'CREATE_PRIVATE_GAME',
	'CANCEL_PRIVATE_GAME',
	'JOIN_QUEUE',
	'LEAVE_QUEUE',
	'JOIN_PRIVATE_GAME',
	'TURN_ACTION',
	'FORFEIT',
)

export type ClientMessages = [
	{type: typeof clientMessages.GET_UPDATES},
	{type: typeof clientMessages.UPDATE_DECK; deck: PlayerDeckT},
	{type: typeof clientMessages.UPDATE_MINECRAFT_NAME; name: string},
	{type: typeof clientMessages.CREATE_PRIVATE_GAME},
	{type: typeof clientMessages.CANCEL_PRIVATE_GAME},
	{type: typeof clientMessages.JOIN_QUEUE},
	{type: typeof clientMessages.LEAVE_QUEUE},
	{type: typeof clientMessages.JOIN_PRIVATE_GAME; code: string},
	{
		type: typeof clientMessages.TURN_ACTION
		action: {
			type: string
			playerEntity: PlayerEntity
			payload: any
		}
	},
	{type: typeof clientMessages.FORFEIT},
]

export type ClientMessage = Message<ClientMessages>
export type ClientMessageTable = MessageTable<ClientMessages>
