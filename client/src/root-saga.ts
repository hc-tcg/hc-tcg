import {take, call, put, select} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import socket from './socket'

// todo show connection indicator in top right corner
function* sendMsg(type: string, payload?: any): any {
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

function* receiveMsg(type: string): any {
	return yield new Promise((resolve: any) => {
		socket.once(type, (message: string) => {
			console.log('[receive]', type, message)
			resolve(message)
		})
	})
}

function* rootSaga(): SagaIterator {
	const {playerName} = yield take('SET_NAME')
	yield call(sendMsg, 'SET_NAME', playerName)
	const {playerId, playerSecret} = yield call(receiveMsg, 'PLAYER_INFO')
	yield put({type: 'SET_PLAYER_INFO', playerId, playerSecret})
	const {gameType} = yield take('SET_GAME_TYPE')
	// TODO
	if (gameType !== 'stranger')
		throw new Error('Friend matchmaking not yet supported')

	yield call(sendMsg, 'JOIN_GAME')
	const {payload} = yield call(receiveMsg, 'GAME_STATE')
	yield put({type: 'GAME_STATE', ...payload})
}

export default rootSaga
