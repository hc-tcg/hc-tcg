import {AnyAction} from 'redux'
import {SagaIterator} from 'redux-saga'
import {takeEvery} from 'redux-saga/effects'

function* setSettingSaga(action: AnyAction): SagaIterator {
	const {key, value} = action.payload
	const storeValue = JSON.stringify(value)
	localStorage.setItem('settings:' + key, storeValue)
}

function* settingsSaga() {
	yield takeEvery('SET_SETTING', setSettingSaga)
}

export default settingsSaga
