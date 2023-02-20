import {takeEvery, all, put, take, race, delay} from 'redux-saga/effects'
import {getStarterPack} from '../utils/state-gen'
import {validateDeck} from '../utils'
import CARDS from '../cards'
import {Root} from './root'
import {Socket} from 'socket.io'

const KEEP_PLAYER_AFTER_DISCONNECT_MS = 1000 * 60

export class Player {
	/**
	 * @param {string} playerName
	 * @param {Socket} socket
	 */
	constructor(playerName, socket) {
		// create a new player
		console.log('new player created')

		/** @type {string} */
		this.playerId = Math.random().toString()

		/** @type {string} */
		this.playerSecret = Math.random().toString()

		/** @type {Array<string>} */
		this.playerDeck = getStarterPack()

		/** @type {string} */
		this.playerName = playerName

		/** @type {Socket} */
		this.socket = socket
	}
}

/**
 * @param {Root} root
 */
function* playerConnectedSaga(root, action) {
	const {playerName, socket} = action.payload

	if (action.payload.playerId) {
		const existingPlayer = root.allPlayers[action.payload.playerId]
		const validPlayer =
			existingPlayer?.playerSecret === action.payload.playerSecret

		// console.log('User reconnected: ', action.payload.playerId)
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

	const newPlayer = new Player(playerName, socket)
	root.allPlayers[newPlayer.id] = newPlayer

	yield put({type: 'PLAYER_CONNECTED', payload: newPlayer})

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

/**
 * @param {Root} root
 */
function* playerDisconnectedSaga(root, action) {
	const {socket} = action.payload

	const player = Object.values(root.allPlayers).find(
		(player) => player.socket === socket
	)
	if (!player) return
	const {playerId} = player

	// console.log('User disconnected: ', playerId)
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
		// console.log('User removed: ', playerId)
		yield put({type: 'PLAYER_REMOVED', payload: player}) // @TODO will we try to get playerId here after instance is deleted?
		delete root.allPlayers[playerId]
	}
}

/**
 * @param {Root} root
 */
function* updateDeckSaga(root, action) {
	const {playerId} = action
	let newDeck = action.payload
	const player = root.allPlayers[playerId]
	if (!player) return
	if (!newDeck || !Array.isArray(newDeck)) return
	newDeck = newDeck.filter((cardId) => cardId in CARDS)

	const validationMessage = validateDeck(newDeck)
	if (validationMessage) return
	player.playerDeck = newDeck

	player.socket?.emit('NEW_DECK', {
		type: 'NEW_DECK',
		payload: newDeck,
	})
}

/**
 * Handles player connects, disconnects, and decks
 * @param {Root} root
 */
export function* playerSaga(root) {
	yield takeEvery('CLIENT_CONNECTED', playerConnectedSaga, root)
	yield takeEvery('CLIENT_DISCONNECTED', playerDisconnectedSaga, root)
	yield takeEvery('UPDATE_DECK', updateDeckSaga, root)
}
