import {takeEvery, all, put, take, race, delay} from 'redux-saga/effects'

const KEEP_PLAYER_AFTER_DISCONNECT_MS = 1000 * 60

function* playerConnectedSaga(players, action) {
	const {playerName, socket} = action.payload

	if (action.payload.playerId) {
		const existingPlayer = players[action.payload.playerId]
		const validPlayer =
			existingPlayer?.playerSecret === action.payload.playerSecret

		console.log('@reconnecting: ', validPlayer)
		if (validPlayer) {
			existingPlayer.socket = socket
			yield put({type: 'PLAYER_RECONNECTED', payload: existingPlayer})
			socket.emit('PLAYER_RECONNECTED', {type: 'PLAYER_RECONNECTED'})
		} else {
			socket.emit('INVALID_PLAYER', {type: 'INVALID_PLAYER'})
		}
		return
	}

	const playerId = Math.random().toString()
	const playerSecret = Math.random().toString()

	console.log('User connected: ', playerId)

	const playerInfo = {
		playerId,
		playerSecret,
		playerName,
		socket,
	}
	players[playerId] = playerInfo

	yield put({type: 'PLAYER_CONNECTED', payload: playerInfo})

	yield delay(500)

	socket.emit('PLAYER_INFO', {
		type: 'PLAYER_INFO',
		payload: {
			playerId,
			playerSecret,
			playerName,
		},
	})
}

function* playerDisconnectedSaga(players, action) {
	const {socket} = action.payload

	const player = Object.values(players).find(
		(player) => player.socket === socket
	)
	if (!player) return
	const {playerId} = player

	console.log('User disconnected: ', playerId)
	yield put({type: 'PLAYER_DISCONNECTED', payload: player})

	const result = yield race({
		timeout: delay(KEEP_PLAYER_AFTER_DISCONNECT_MS),
		reconnect: take(
			(action) =>
				action.type === 'PLAYER_RECONNECTED' &&
				action.payload.playerId === playerId
		),
	})

	if (result.timeout) {
		console.log('User removed: ', playerId)
		yield put({type: 'PLAYER_REMOVED', payload: player})
		delete players[playerId]
	}
}

function* playerSaga(players) {
	yield takeEvery('CLIENT_CONNECTED', playerConnectedSaga, players)
	yield takeEvery('CLIENT_DISCONNECTED', playerDisconnectedSaga, players)
}

export default playerSaga
