import {all, fork} from 'redux-saga/effects'
import gameSaga from './game'
import userSaga from './user'

function* rootSaga() {
	console.log('sagas running')
	yield all([fork(gameSaga), fork(userSaga)])
}

export default rootSaga
