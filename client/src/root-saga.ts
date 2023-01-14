import {take, call, put, select, race, cancelled} from 'redux-saga/effects'
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

function* gameSaga(): SagaIterator {
	while (true) {
		const gameAction = yield race({
			gameState: call(receiveMsg, 'GAME_STATE'),
			gameEnd: call(receiveMsg, 'GAME_END'),
		})

		if (gameAction.gameEnd) {
			yield put({type: 'GAME_END'})
			break
		}

		const {payload} = gameAction.gameState

		yield put({type: 'GAME_STATE', ...payload})

		if (payload.availableActions.includes('WAIT_FOR_TURN')) continue

		const turnAction = yield race({
			playCard: take('PLAY_CARD'),
			attack: take('ATTACK'),
			endTurn: take('END_TURN'),
			changeActiveHermit: take('CHANGE_ACTIVE_HERMIT'),
		})

		// TODO - consider what is being send to backend and in which format
		if (turnAction.playCard) {
			yield call(sendMsg, 'PLAY_CARD', turnAction.playCard.payload)
		} else if (turnAction.attack) {
			yield call(sendMsg, 'ATTACK', turnAction.attack.payload)
		} else if (turnAction.endTurn) {
			yield call(sendMsg, 'END_TURN')
		} else if (turnAction.changeActiveHermit) {
			yield call(
				sendMsg,
				'CHANGE_ACTIVE_HERMIT',
				turnAction.changeActiveHermit.payload
			)
		}
	}
}

function* rootSaga(): SagaIterator {
	const {playerName} = yield take('SET_NAME')
	socket.auth = {playerName}
	socket.connect()
	const {playerId, playerSecret} = yield call(receiveMsg, 'PLAYER_INFO')
	yield put({type: 'SET_PLAYER_INFO', playerId, playerSecret})
	while (true) {
		const {gameType} = yield take('SET_GAME_TYPE')
		// TODO
		if (gameType !== 'stranger')
			throw new Error('Friend matchmaking not yet supported')

		yield call(sendMsg, 'JOIN_GAME')
		yield call(gameSaga)
	}
}

export default rootSaga
