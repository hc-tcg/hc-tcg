import {PlayerModel} from 'common/models/player-model'
import {
	invalidPlayer,
	loadUpdates,
	newDeck,
	newMinecraftName,
	playerInfo,
	playerReconnected,
} from 'common/socket-messages/server-messages'
import {delay, put, race, take, takeEvery} from 'typed-redux-saga'
import {broadcast} from 'utils/comm'
import root from '../serverRoot'

const KEEP_PLAYER_AFTER_DISCONNECT_MS = 1000 * 30

function* playerConnectedSaga(action: any) {
	const {playerName, minecraftName, deck, socket} = action.payload

	if (action.payload.playerId) {
		const existingPlayer = root.players[action.payload.playerId]
		const validPlayer = existingPlayer?.secret === action.payload.playerSecret

		if (validPlayer) {
			existingPlayer.socket = socket
			if (deck) existingPlayer.setPlayerDeck(deck)
			yield* put({type: 'PLAYER_RECONNECTED', payload: existingPlayer})
			broadcast([existingPlayer], playerReconnected(existingPlayer.deck))
		} else {
			broadcast([existingPlayer], invalidPlayer())
		}
		return
	}

	const newPlayer = new PlayerModel(playerName, minecraftName, socket)
	if (deck) newPlayer.setPlayerDeck(deck)
	root.addPlayer(newPlayer)

	root.hooks.playerJoined.call(newPlayer)
	yield* put({type: 'PLAYER_CONNECTED', payload: newPlayer})

	yield* delay(500)

	broadcast([newPlayer], playerInfo(newPlayer.getPlayerInfo()))
}

function* playerDisconnectedSaga(action: any) {
	const {socket} = action.payload

	const player = root.getPlayers().find((player) => player.socket === socket)
	if (!player) return
	const {id: playerId} = player

	// Remove player from queues straight away
	root.hooks.playerLeft.call(player)

	yield* put({type: 'PLAYER_DISCONNECTED', payload: player})

	const result = yield* race({
		timeout: delay(KEEP_PLAYER_AFTER_DISCONNECT_MS),
		reconnect: take(
			(action: any) =>
				action.type === 'PLAYER_RECONNECTED' && action.payload.id === playerId,
		),
	})

	if (result.timeout) {
		yield* put({type: 'PLAYER_REMOVED', payload: player}) // @TODO will we try to get playerId here after instance is deleted?
		delete root.players[playerId]
	}
}

function* updateDeckSaga(action: any) {
	const {playerId} = action
	let playerDeck = action.payload
	const player = root.players[playerId]
	if (!player) return
	player.setPlayerDeck(playerDeck)

	broadcast([player], newDeck(player.deck))
}

function* updateMinecraftNameSaga(action: any) {
	const {playerId} = action
	let minecraftName = action.payload
	const player = root.players[playerId]
	if (!player) return
	player.setMinecraftName(minecraftName)

	broadcast([player], newMinecraftName(player.minecraftName))
}

function* loadUpdatesSaga(action: any) {
	const {playerId} = action
	const player = root.players[playerId]

	if (!player) {
		console.error('Found undefined player with id:', player)
		return
	}

	broadcast([player], loadUpdates(root.updates))
}

export function* playerSaga() {
	yield* takeEvery('CLIENT_CONNECTED', playerConnectedSaga)
	yield* takeEvery('CLIENT_DISCONNECTED', playerDisconnectedSaga)
	yield* takeEvery('UPDATE_DECK', updateDeckSaga)
	yield* takeEvery('UPDATE_MINECRAFT_NAME', updateMinecraftNameSaga)
	yield* takeEvery('GET_UPDATES', loadUpdatesSaga)
}
