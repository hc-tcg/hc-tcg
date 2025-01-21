import databaseSaga from 'logic/game/database/database-saga'
import localSettingsSaga from 'logic/local-settings/local-settings-saga'
import matchmakingSaga from 'logic/matchmaking/matchmaking-saga'
import {localMessages} from 'logic/messages'
import {
	databaseConnectionSaga,
	databaseErrorSaga,
	loginSaga,
	logoutSaga,
	minecraftNameSaga,
	newDeckSaga,
	newDecksSaga,
	recieveCurrentImportSaga,
	recieveStatsSaga,
	updatesSaga,
} from 'logic/session/session-saga'
import socketSaga from 'logic/socket/socket-saga'
import soundSaga from 'logic/sound/sound-saga'
import {SagaIterator} from 'redux-saga'
import {all, call, fork, race, take} from 'redux-saga/effects'

function* appSaga(): SagaIterator {
	yield call(loginSaga)
	yield fork(databaseConnectionSaga)
	yield fork(logoutSaga)
	yield fork(newDecksSaga)
	yield fork(newDeckSaga)
	yield fork(recieveStatsSaga)
	yield fork(recieveCurrentImportSaga)
	yield fork(databaseErrorSaga)
	yield fork(minecraftNameSaga)
	yield fork(matchmakingSaga)
	yield fork(updatesSaga)
}

function* rootSaga(): SagaIterator {
	yield all([
		fork(socketSaga),
		fork(localSettingsSaga),
		fork(databaseSaga),
		fork(soundSaga),
	])
	while (true) {
		console.log('Starting game loop')
		const result = yield race({
			disconnect: take(localMessages.DISCONNECT),
			app: call(appSaga),
		})
		console.log('Game loop end: ', result)
	}
}

export default rootSaga
