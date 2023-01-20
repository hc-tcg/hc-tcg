import {SagaIterator} from 'redux-saga'
import {select, cancelled} from 'redux-saga/effects'
import socket from '../socket'

// TODO - show connection indicator in top right corner
export function* sendMsg(type: string, payload?: any): any {
	while (true) {
		if (socket.connected) {
			console.log('[send]', type, payload)
			const {playerId, playerSecret} = yield select()
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

export function* receiveMsg(type: string): any {
	let listener
	try {
		return yield new Promise((resolve: any) => {
			listener = (message: string) => {
				console.log('[receive]', type, message)
				resolve(message)
			}
			socket.once(type, listener)
		})
	} finally {
		if (yield cancelled()) socket.off(type, listener)
	}
}

function* socketSaga(playerName: string): SagaIterator {
	socket.auth = {playerName}
	socket.connect()
}

export default socketSaga
