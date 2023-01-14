import {takeEvery, all, put} from 'redux-saga/effects'

function* playerConnectedSaga(players, action) {
	const playerId = Math.random().toString()
	const playerSecret = Math.random().toString()
	const {playerName, socket} = action.payload

	console.log('User connected: ', playerId)

	players[playerId] = {
		playerId,
		playerSecret,
		playerName,
		socket,
	}

	// TODO - handle disconnects & reconnects
	socket.emit('PLAYER_INFO', {
		type: 'PLAYER_INFO',
		playerId,
		playerSecret,
	})
}

function* playerDisconnectedSaga(players, action) {
	const {socket} = action.payload

	// TODO - handle reconnect & kill games on timeout
	Object.entries(players).forEach(([playerId, playerInfo]) => {
		if (playerInfo.socket === socket) {
			console.log('User disconnected: ', playerId)
			delete players[playerId]
		}
	})
}

function* playerSaga(players) {
	yield takeEvery('PLAYER_CONNECTED', playerConnectedSaga, players)
	yield takeEvery('PLAYER_DISCONNECTED', playerDisconnectedSaga, players)
}

export default playerSaga
