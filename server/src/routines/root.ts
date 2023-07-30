import {all, fork} from 'redux-saga/effects'
import matchmakingSaga from './matchmaking'
import {playerSaga} from './player'
import {SagaIterator} from 'redux-saga'

function* rootSaga(): SagaIterator {
	console.log('sagas running')
	yield all([fork(matchmakingSaga), fork(playerSaga)])
}

export default rootSaga
