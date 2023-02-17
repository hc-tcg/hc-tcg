import {takeEvery} from 'redux-saga/effects'

import FirebaseLogs from '../logs'
import server from '../server'

function* logsSaga() {
	new FirebaseLogs().register(server)

	yield takeEvery('PLAYER_CONNECTED', function* ({payload}) {
		server.hooks.playerJoined.call(payload)
	})

	yield takeEvery('PLAYER_REMOVED', function* ({payload}) {
		server.hooks.playerLeft.call(payload)
	})

	yield takeEvery('NEW_GAME', function* ({payload}) {
		server.hooks.newGame.call(payload)
	})
}

export default logsSaga
