import {SagaIterator} from 'redux-saga'
import {takeEvery, call, put, fork} from 'redux-saga/effects'
import {BattleLogT} from 'common/types/game-state'
import {addBattleLogEntry} from '../game-actions'
import {receiveMsg} from 'logic/socket/socket-saga'

function* receiveEntrySaga(): SagaIterator {
	while (true) {
		const result = yield call(receiveMsg, 'BATTLE_LOG_ENTRY')
		const entries = result.payload.slice().reverse()
		yield put(addBattleLogEntry(entries))
	}
}

function* battleLogSaga(): SagaIterator {
	try {
		yield fork(receiveEntrySaga)
	} catch (err) {
		console.error('Battle log error: ', err)
	}
}

export default battleLogSaga
