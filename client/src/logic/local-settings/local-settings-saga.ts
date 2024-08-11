import {localMessages, LocalMessageTable} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {takeEvery} from 'redux-saga/effects'

function* setSettingSaga(
	action: LocalMessageTable[typeof localMessages.SETTINGS_SET],
): SagaIterator {
	const {key, value} = action.setting
	const storeValue = JSON.stringify(value)
	localStorage.setItem('settings:' + key, storeValue)
}

function* settingsSaga() {
	yield takeEvery(localMessages.SETTINGS_SET, setSettingSaga)
}

export default settingsSaga
