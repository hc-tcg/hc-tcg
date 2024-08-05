import {all, fork} from 'typed-redux-saga'
import handleClientMessage from './handle-client-message'
import matchmakingSaga from './matchmaking'

function* rootSaga() {
	console.log('sagas running')
	yield* all([fork(handleClientMessage), fork(matchmakingSaga)])
}

export default rootSaga
