import {all, fork} from 'redux-saga/effects'
import {Root} from '../classes/root'
import matchmakingSaga from './matchmaking'
import {playerSaga} from './player'

function* rootSaga() {
	console.log('sagas running')
	const root = new Root()
	yield all([fork(matchmakingSaga, root), fork(playerSaga, root)])
}

export default rootSaga
