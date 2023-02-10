import {takeEvery, all, put, take, race, delay} from 'redux-saga/effects'
import {getStarterPack} from '../utils/state-gen'
import CARDS from '../cards'

const KEEP_PLAYER_AFTER_DISCONNECT_MS = 1000 * 60

function* playerConnectedSaga(players, action) {
	const {playerName, socket} = action.payload

	if (action.payload.playerId) {
		const existingPlayer = players[action.payload.playerId]
		const validPlayer =
			existingPlayer?.playerSecret === action.payload.playerSecret

		console.log('User reconnected: ', action.payload.playerId)
		if (validPlayer) {
			existingPlayer.socket = socket
			yield put({type: 'PLAYER_RECONNECTED', payload: existingPlayer})
			socket.emit('PLAYER_RECONNECTED', {
				type: 'PLAYER_RECONNECTED',
				payload: existingPlayer.playerDeck,
			})
		} else {
			socket.emit('INVALID_PLAYER', {type: 'INVALID_PLAYER'})
		}
		return
	}

	const playerId = Math.random().toString()
	const playerSecret = Math.random().toString()
	const playerDeck = getStarterPack()

	console.log('User connected: ', playerId)

	const playerInfo = {
		playerId,
		playerSecret,
		playerName,
		playerDeck,
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
			playerDeck,
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

function* updateDeckSaga(players, action) {
	const {playerId} = action
	let newDeck = action.payload
	const player = players[playerId]
	if (!player) return
	if (!newDeck || !Array.isArray(newDeck)) return
	newDeck = newDeck.filter((cardId) => cardId in CARDS)
	if (newDeck.length < 30 || newDeck.length > 50) return
	// TODO - validate deck
	player.playerDeck = newDeck

	player.socket?.emit('NEW_DECK', {
		type: 'NEW_DECK',
		payload: newDeck,
	})
}

function* playerSaga(players) {
	yield takeEvery('CLIENT_CONNECTED', playerConnectedSaga, players)
	yield takeEvery('CLIENT_DISCONNECTED', playerDisconnectedSaga, players)
	yield takeEvery('UPDATE_DECK', updateDeckSaga, players)
}

export default playerSaga
