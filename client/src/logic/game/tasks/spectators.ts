import {sendMsg} from 'logic/socket/socket-saga'
import {SagaIterator} from 'redux-saga'
import {call, takeEvery} from 'redux-saga/effects'
import {put, select} from 'typed-redux-saga'
import {getPlayerId} from 'logic/session/session-selectors'
import {gameEnd} from '../game-actions'

function* spectatorLeave(cancelBackgroundTasks: any) {
	let playerId = yield* select(getPlayerId)

	yield call(sendMsg, 'SPECTATOR_LEAVE', {id: playerId})
	yield put({type: 'SPECTATOR_LEAVE'})
	yield put(gameEnd())
	yield* cancelBackgroundTasks()
}

function* spectatorSaga(cancelBackgroundTasks: any): SagaIterator {
	yield takeEvery('SPECTATOR_LEAVE', spectatorLeave, cancelBackgroundTasks)
}

export default spectatorSaga
