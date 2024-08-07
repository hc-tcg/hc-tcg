import {all, fork} from 'typed-redux-saga'
import handleClientMessage from './handle-client-message'
import handleLocalMessage from './handle-local-message'
import matchmakingSaga from './matchmaking'

function* rootSaga() {
	console.log('sagas running')
	yield* all([
		fork(handleClientMessage),
		fork(handleLocalMessage),
		fork(matchmakingSaga),
	])
}

export default rootSaga
