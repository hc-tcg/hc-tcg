import {LocalMessageTable, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {takeEvery} from 'redux-saga/effects'

function* setDatabaseKeysSaga(
	action: LocalMessageTable[typeof localMessages.SET_ID_AND_SECRET],
): SagaIterator {
	localStorage.setItem('databaseInfo:userId', action.userId)
	localStorage.setItem('databaseInfo:secret', action.secret)
}

function* databaseSaga() {
	yield takeEvery(localMessages.SET_ID_AND_SECRET, setDatabaseKeysSaga)
}

export default databaseSaga
