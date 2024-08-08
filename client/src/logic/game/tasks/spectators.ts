import {sendMsg} from 'logic/socket/socket-saga'
import {SagaIterator} from 'redux-saga'
import {takeEvery} from 'redux-saga/effects'
import {put} from 'typed-redux-saga'
import {gameEnd} from '../game-actions'
import {localMessages} from 'logic/messages'
import {clientMessages} from 'common/socket-messages/client-messages'

function* spectatorLeave(cancelBackgroundTasks: any) {
	yield sendMsg({type: clientMessages.SPECTATOR_LEAVE})
	yield put(gameEnd())
	yield* cancelBackgroundTasks()
}

function* spectatorSaga(cancelBackgroundTasks: any): SagaIterator {
	yield takeEvery(
		localMessages.GAME_SPECTATOR_LEAVE,
		spectatorLeave,
		cancelBackgroundTasks,
	)
}

export default spectatorSaga
