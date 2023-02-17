import {all, fork} from 'redux-saga/effects'
import matchmakingSaga from './matchmaking'
import playerSaga from './player'
import logsSaga from './logs'
import server from '../server'

function* rootSaga() {
	console.log('sagas running')
	const players = server.allPlayers
	yield all([
		fork(logsSaga),
		fork(matchmakingSaga, players),
		fork(playerSaga, players),
	])
}

export default rootSaga
