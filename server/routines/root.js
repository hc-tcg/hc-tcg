import {all, fork} from 'redux-saga/effects'
import gameSaga from './game'
import playerSaga from './player'

function* rootSaga() {
	console.log('sagas running')
	const players = {}
	yield all([fork(gameSaga, players), fork(playerSaga, players)])
}

export default rootSaga
