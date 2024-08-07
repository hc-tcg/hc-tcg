import { actions } from 'logic/messages'
import fbdbSaga from 'logic/fbdb/fbdb-saga'
import localSettingsSaga from 'logic/local-settings/local-settings-saga'
import matchmakingSaga from 'logic/matchmaking/matchmaking-saga'
import {
	loginSaga,
	logoutSaga,
	minecraftNameSaga,
	newDeckSaga,
	updatesSaga,
} from 'logic/session/session-saga'
import socketSaga from 'logic/socket/socket-saga'
import soundSaga from 'logic/sound/sound-saga'
import {SagaIterator} from 'redux-saga'
import {all, call, fork, race, take} from 'redux-saga/effects'

function* appSaga(): SagaIterator {
	yield call(loginSaga)
	yield fork(logoutSaga)
	yield fork(newDeckSaga)
	yield fork(minecraftNameSaga)
	yield fork(matchmakingSaga)
	yield fork(updatesSaga)
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
			disconnect: take(actions.DISCONNECT),
			app: call(appSaga),
		})
		console.log('Game loop end: ', result)
	}
}

export default rootSaga
