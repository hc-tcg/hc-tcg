import {take, fork, takeEvery, call, put, race} from 'redux-saga/effects'
import {cancelled} from 'typed-redux-saga'
import {SagaIterator} from 'redux-saga'
import {AnyAction} from 'redux'
import {sendMsg, receiveMsg} from 'logic/socket/socket-saga'
import gameSaga from 'logic/game/game-saga'
import {gameEnd} from 'logic/game/game-actions'
import {
	codeReceived,
	leaveMatchmaking,
	invalidCode,
} from './matchmaking-actions'

function* randomMatchmakingSaga(): SagaIterator {
	try {
		yield call(sendMsg, 'RANDOM_MATCHMAKING')
		yield call(receiveMsg, 'GAME_START')
		yield call(gameSaga)
	} catch (err) {
		console.error('Game crashed: ', err)
	} finally {
		if (yield* cancelled()) yield put(gameEnd())
	}
}

function* createPrivateSaga(): SagaIterator {
	try {
		yield call(sendMsg, 'CREATE_PRIVATE_GAME')
		const {payload: gameCode} = yield call(receiveMsg, 'PRIVATE_GAME_CODE')
		yield put(codeReceived(gameCode))
		const result = yield race({
			gameStart: call(receiveMsg, 'GAME_START'),
			timeout: call(receiveMsg, 'MATCHMAKING_TIMEOUT'),
		})
		if (result.gameStart) yield call(gameSaga)
	} catch (err) {
		console.error('Game crashed: ', err)
	} finally {
		if (yield* cancelled()) yield put(gameEnd())
	}
}

function* joinPrivateSaga(): SagaIterator {
	try {
		while (true) {
			const {payload: gameCode} = yield take('SET_MATCHMAKING_CODE')
			yield call(sendMsg, 'JOIN_PRIVATE_GAME', gameCode)
			const result = yield race({
				invalidCode: call(receiveMsg, 'INVALID_CODE'),
				gameStart: call(receiveMsg, 'GAME_START'),
			})
			if (result.gameStart) break
			yield put(invalidCode())
		}
		yield call(gameSaga)
	} catch (err) {
		console.error('Game crashed: ', err)
	} finally {
		if (yield* cancelled()) yield put(gameEnd())
	}
}

function* enterMatchmaking(action: AnyAction): SagaIterator {
	const type = action.type
	if (type === 'RANDOM_MATCHMAKING') {
		yield call(randomMatchmakingSaga)
	} else if (type === 'CREATE_PRIVATE_GAME') {
		yield call(createPrivateSaga)
	} else if (type === 'JOIN_PRIVATE_GAME') {
		yield call(joinPrivateSaga)
	}
}

function* reconnectSaga(): SagaIterator {
	const gameReconnect = yield call(receiveMsg, 'GAME_STATE')
	yield put(leaveMatchmaking())
	yield call(gameSaga, gameReconnect.payload.localGameState)
}

function* newMatchmaking(action: AnyAction): SagaIterator {
	const result = yield race({
		matchmaking: call(enterMatchmaking, action),
		leave: take('LEAVE_MATCHMAKING'),
	})
	if (Object.hasOwn(result, 'matchmaking')) {
		yield put(leaveMatchmaking())
	} else {
		yield call(sendMsg, 'LEAVE_MATCHMAKING')
	}
}

function* matchmakingSaga(): SagaIterator {
	yield takeEvery(
		['RANDOM_MATCHMAKING', 'CREATE_PRIVATE_GAME', 'JOIN_PRIVATE_GAME'],
		newMatchmaking
	)
	yield fork(reconnectSaga)
}

export default matchmakingSaga
