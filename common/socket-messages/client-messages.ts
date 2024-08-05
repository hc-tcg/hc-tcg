import {Action, actions} from '../redux-actions'
import {PlayerDeckT} from '../types/deck'

export const clientMessages = actions(
	'GET_UPDATES',
	'UPDATE_DECK',
	'UPDATE_MINECRAFT_NAME',
)

const payloadConstructors = () => ({
	getUpdates,
	updateDeck,
	updateMinecraftName,
})

export type ClientMessage = Action<typeof payloadConstructors>
export type ClientMessageTable = Action<typeof payloadConstructors>

export const getUpdates = () => ({
	type: clientMessages.GET_UPDATES,
})

export const updateDeck = (deck: PlayerDeckT) => ({
	type: clientMessages.UPDATE_DECK,
	payload: deck,
})

export const updateMinecraftName = (name: string) => ({
	type: clientMessages.UPDATE_MINECRAFT_NAME,
	payload: name,
})
