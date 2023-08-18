import {all, fork} from 'typed-redux-saga'
import matchmakingSaga from './matchmaking'
import {playerSaga} from './player'

function* rootSaga() {
	console.log('sagas running')
	yield* all([fork(matchmakingSaga), fork(playerSaga)])
}

export default rootSaga
