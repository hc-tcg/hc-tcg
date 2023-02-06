import {take, fork, call, race} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import socketSaga from 'logic/socket/socket-saga'
import {loginSaga, logoutSaga} from 'logic/session/session-saga'
import matchmakingSaga from 'logic/matchmaking/matchmaking-saga'

function* appSaga(): SagaIterator {
	yield call(loginSaga)
	yield fork(logoutSaga)
	yield fork(matchmakingSaga)
}

function* rootSaga(): SagaIterator {
	yield fork(socketSaga)
	while (true) {
		console.log('Starting game loop')
		const result = yield race({
			disconnect: take('DISCONNECT'),
			app: call(appSaga),
		})
		console.log('Game loop end: ', result)
	}
}

export default rootSaga
