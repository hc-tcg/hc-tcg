import {all, take, fork, call, race} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import socketSaga from 'logic/socket/socket-saga'
import {loginSaga, logoutSaga, newDeckSaga} from 'logic/session/session-saga'
import matchmakingSaga from 'logic/matchmaking/matchmaking-saga'
import fbdbSaga from 'logic/fbdb/fbdb-saga'
import localSettingsSaga from 'logic/local-settings/local-settings-saga'
import soundSaga from 'logic/sound/sound-saga'

function* appSaga(): SagaIterator {
	yield call(loginSaga)
	yield fork(logoutSaga)
	yield fork(newDeckSaga)
	yield fork(matchmakingSaga)
}

function* rootSaga(): SagaIterator {
	yield all([
		fork(socketSaga),
		fork(fbdbSaga),
		fork(localSettingsSaga),
		fork(soundSaga),
	])
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
