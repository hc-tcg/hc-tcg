import {sendMsg} from 'logic/socket/socket-saga'
import {SagaIterator} from 'redux-saga'
import {call, takeEvery} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {getPlayerId} from 'logic/session/session-selectors'

function* spectatorLeave(): SagaIterator {
	let playerId = yield* select(getPlayerId)

	yield call(sendMsg, 'SPECTATOR_LEAVE', {id: playerId})
}

function* spectatorSaga(): SagaIterator {
	yield takeEvery('SPECTATOR_LEAVE', spectatorLeave)
}

export default spectatorSaga
