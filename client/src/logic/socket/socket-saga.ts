import {ClientMessage} from 'common/socket-messages/client-messages'
import {ServerMessageTable} from 'common/socket-messages/server-messages'
import {LocalMessage, localMessages} from 'logic/messages'
import {getSession} from 'logic/session/session-selectors'
import {SagaIterator} from 'redux-saga'
import {eventChannel} from 'redux-saga'
import {put, select, takeEvery} from 'typed-redux-saga'
import {getSocket} from './socket-selectors'

let messagesThatHaveNotBeenSent: Array<ClientMessage> = []

export function* sendMsg(payload: ClientMessage) {
	const socket = yield* select(getSocket)

	if (socket.connected) {
		console.log('[send]', payload.type, payload)
		const {playerId, playerSecret} = yield* select(getSession)
		socket.emit(payload.type, {
			type: payload.type,
			payload,
			playerId,
			playerSecret,
		})
		return 'success'
	} else {
		console.error('Can not send message when socket is not connected')
		messagesThatHaveNotBeenSent.push(payload)
		return 'failure'
	}
}

export function sendMessagesThatFailedToSend(
	session: {
		playerId: string
		playerSecret: string
	},
	socket: any,
) {
	return () => {
		console.log(
			`Socket connected, attempting to send ${messagesThatHaveNotBeenSent.length} messages that failed to send.`,
		)
		let attempts = 0
		while (messagesThatHaveNotBeenSent.length > 0) {
			let payload = messagesThatHaveNotBeenSent.pop()
			if (!payload) continue
			socket.emit(payload.type, {
				type: payload.type,
				payload,
				playerId: session.playerId,
				playerSecret: session.playerSecret,
			})
			if (attempts > 100) {
				throw new Error('Could not send all messages after reconnect.')
			}
			attempts += 1
		}
	}
}

export function receiveMsg<T extends keyof ServerMessageTable>(
	socket: any,
	type: T,
) {
	return () => {
		return new Promise<ServerMessageTable[T]>((resolve) => {
			const listener = (message: ServerMessageTable[T]) => {
				resolve(message)
			}
			socket.once(type as string, listener as any)
		})
	}
}

function* socketSaga(): SagaIterator {
	const socket = yield* select(getSocket)
	const session = yield* select(getSession)

	const channel = eventChannel((emitter: any): any => {
		const connectListener = () => emitter('connect')
		const disconnectListener = () => emitter('disconnect')
		const connectErrorListener = () => emitter('connect_error')

		socket.on('connect', connectListener)
		socket.on('connect', sendMessagesThatFailedToSend(session, socket))
		socket.on('disconnect', disconnectListener)
		socket.on('connect_error', connectErrorListener)
		return () => {
			socket.off('connect', connectListener)
			socket.off('disconnect', disconnectListener)
			socket.off('connect_error', connectErrorListener)
		}
	})
	yield* takeEvery(channel, function* (type) {
		console.log('@socket: ', type)
		if (type === 'connect')
			yield* put<LocalMessage>({type: localMessages.SOCKET_CONNECT})
		if (type === 'disconnect')
			yield* put<LocalMessage>({type: localMessages.SOCKET_DISCONNECT})
		if (type === 'connect_error')
			yield* put<LocalMessage>({type: localMessages.SOCKET_CONNECT_ERROR})
	})
}

export default socketSaga
