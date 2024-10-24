import {LocalMessageTable, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {takeEvery} from 'redux-saga/effects'

function* setDatabaseKeysSaga(
	action: LocalMessageTable[typeof localMessages.SETTINGS_SET],
): SagaIterator {
	const {key, value} = action.setting
	const storeValue = JSON.stringify(value)
	localStorage.setItem('settings:' + key, storeValue)
}

function* databaseKeysSaga() {
	yield takeEvery(localMessages.SETTINGS_SET, setDatabaseKeysSaga)
}

export default databaseKeysSaga
