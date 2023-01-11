import {takeEvery, put} from 'redux-saga/effects'
import playerSockets from '../be-socket'

function* userSaga() {
	yield takeEvery('SET_NAME', function* (action) {
		const playerId = Math.random().toString()
		const playerSecret = Math.random().toString()

		// TODO - handle disconnects & reconnects
		playerSockets[playerId] = action.socket
		action.socket.emit('PLAYER_INFO', {
			type: 'PLAYER_INFO',
			playerId,
			playerSecret,
		})
	})
}

export default userSaga
