import {takeEvery, put} from 'redux-saga/effects'
import {cancelled, select} from 'typed-redux-saga'
import {SagaIterator} from 'redux-saga'
import {eventChannel} from 'redux-saga'
import socket from 'socket'
import {socketConnect, socketDisconnect, socketConnectError} from './socket-actions'
import {getSession} from 'logic/session/session-selectors'

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
