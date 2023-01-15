import {all, fork} from 'redux-saga/effects'
import matchmakingSaga from './matchmaking'
import playerSaga from './player'

function* rootSaga() {
	console.log('sagas running')
	const players = {}
	yield all([fork(matchmakingSaga, players), fork(playerSaga, players)])
}

export default rootSaga
