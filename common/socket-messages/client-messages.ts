import {Action, actions} from '../redux-actions'

export const clientMessages = actions('GET_UPDATES')

const payloadConstructors = () => ({getUpdates})

export type ClientMessage = Action<typeof payloadConstructors>
export type ClientMessageTable = Action<typeof payloadConstructors>

export const getUpdates = () => ({
	type: clientMessages.GET_UPDATES,
})
