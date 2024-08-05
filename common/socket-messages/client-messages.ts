import {Message, messages, MessageTable} from '../redux-actions'
import {PlayerDeckT} from '../types/deck'

export const clientMessages = messages(
	'GET_UPDATES',
	'UPDATE_DECK',
	'UPDATE_MINECRAFT_NAME',
)

export type ClientMessages = [
	{type: typeof clientMessages.GET_UPDATES},
	{type: typeof clientMessages.UPDATE_DECK; deck: PlayerDeckT},
	{type: typeof clientMessages.UPDATE_MINECRAFT_NAME; name: string},
]

export type ClientMessage = Message<ClientMessages>
export type ClientMessageTable = MessageTable<ClientMessages>
