import {all, fork} from 'redux-saga/effects'
import root from '../classes/root'
import matchmakingSaga from './matchmaking'
import {playerSaga} from './player'

function* rootSaga() {
	console.log('sagas running')
	yield all([fork(matchmakingSaga), fork(playerSaga)])
}

export default rootSaga
