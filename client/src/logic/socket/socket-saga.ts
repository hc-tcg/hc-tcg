import {getSession} from 'logic/session/session-selectors'
import {SagaIterator} from 'redux-saga'
import {eventChannel} from 'redux-saga'
import {put, takeEvery} from 'redux-saga/effects'
import socket from 'socket'
import {select} from 'typed-redux-saga'
import {
	socketConnect,
	socketConnectError,
	socketDisconnect,
} from './socket-actions'

export function* sendMsg(type: string, payload?: any): any {
	while (true) {
		if (socket.connected) {
			console.log('[send]', type, payload)
			const {playerId, playerSecret} = yield* select(getSession)
			socket.emit(type, {
				type,
				payload,
				playerId,
				playerSecret,
			})
			break
		}
		yield new Promise((resolve: any) => {
			socket.once('connect', resolve)
		})
	}
}

export type ServerMessage = {
	type: string
	payload?: any
}

export const receiveMsg = (type: string) => {
	return new Promise<ServerMessage>((resolve) => {
		const listener = (message: ServerMessage) => {
			resolve(message)
		}
		socket.once(type, listener)
	})
}

function* socketSaga(): SagaIterator {
	const channel = eventChannel((emitter: any): any => {
		const connectListener = () => emitter('connect')
		const disconnectListener = () => emitter('disconnect')
		const connectErrorListener = () => emitter('connect_error')
		socket.on('connect', connectListener)
		socket.on('disconnect', disconnectListener)
		socket.on('connect_error', connectErrorListener)
		return () => {
			socket.off('connect', connectListener)
			socket.off('disconnect', disconnectListener)
			socket.off('connect_error', connectErrorListener)
		}
	})
	yield takeEvery(channel, function* (type) {
		console.log('@socket: ', type)
		if (type === 'connect') yield put(socketConnect())
		if (type === 'disconnect') yield put(socketDisconnect())
		if (type === 'connect_error') yield put(socketConnectError())
	})
}

export default socketSaga
