import {takeEvery, put, take, race, delay, call} from 'typed-redux-saga'
import {PlayerModel} from 'common/models/player-model'
import root from '../serverRoot'
import Pg from 'plugins/postgres'
import {PlayerDeckT} from 'common/types/deck'

const KEEP_PLAYER_AFTER_DISCONNECT_MS = 1000 * 30

function* playerConnectedSaga(action: any) {
	const {playerName, postgresId, minecraftName, deck, socket} = action.payload

	const uuid = yield* call(Pg.insertUser, postgresId)

	const playerDecks = yield* call(Pg.getUserDecks, postgresId)

	if (action.payload.playerId) {
		const existingPlayer = root.players[action.payload.playerId]
		const validPlayer = existingPlayer?.secret === action.payload.playerSecret

		if (validPlayer) {
			existingPlayer.socket = socket
			if (deck) existingPlayer.setPlayerDeck(deck)
			yield* put({type: 'PLAYER_RECONNECTED', payload: existingPlayer})
			socket.emit('PLAYER_RECONNECTED', {
				type: 'PLAYER_RECONNECTED',
				payload: existingPlayer.deck,
			})
			socket.emit('GET_DECKS', {
				type: 'PLAYER_INFO',
				payload: playerDecks,
			})
		} else {
			socket.emit('INVALID_PLAYER', {type: 'INVALID_PLAYER'})
		}
		return
	}

	const newPlayer = new PlayerModel(playerName, minecraftName, socket, uuid)

	if (deck) newPlayer.setPlayerDeck(deck)
	root.addPlayer(newPlayer)

	root.hooks.playerJoined.call(newPlayer)
	yield* put({type: 'PLAYER_CONNECTED', payload: newPlayer})

	yield* delay(500)

	socket.emit('PLAYER_INFO', {
		type: 'PLAYER_INFO',
		payload: newPlayer.getPlayerInfo(),
	})

	socket.emit('GET_DECKS', {
		type: 'PLAYER_INFO',
		payload: playerDecks,
	})
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
			(action: any) => action.type === 'PLAYER_RECONNECTED' && action.payload.playerId === playerId
		),
	})

	if (result.timeout) {
		yield* put({type: 'PLAYER_REMOVED', payload: player}) // @TODO will we try to get playerId here after instance is deleted?
		delete root.players[playerId]
	}
}

function* updateDeckSaga(action: any) {
	const {playerId} = action
	const newDeck = action.payload
	const player = root.players[playerId]
	if (!player) return
	player.setPlayerDeck(newDeck)

	player.socket?.emit('NEW_DECK', {
		type: 'NEW_DECK',
		payload: player.deck,
	})
}

function* saveDeckSaga(action: any) {
	console.log('saving deck')
	const {playerId} = action
	const deck = action.payload as PlayerDeckT

	const player = root.players[playerId]

	const deckCode = Pg.insertDeck(player.postgresId, deck.name, deck.icon, deck.cards)
	if (!deckCode) console.error('ERROR: DECK NOT CREATED')

	const playerDecks = yield* call(Pg.getUserDecks, player.postgresId)

	player.socket?.emit('GET_DECKS', {
		type: 'GET_DECKS',
		payload: playerDecks,
	})
}

function* updateMinecraftNameSaga(action: any) {
	const {playerId} = action
	let minecraftName = action.payload
	const player = root.players[playerId]
	if (!player) return
	player.setMinecraftName(minecraftName)

	player.socket?.emit('NEW_MINECRAFT_NAME', {
		type: 'NEW_MINECRAFT_NAME',
		payload: player.minecraftName,
	})
}

function* loadUpdatesSaga(action: any) {
	const {playerId} = action
	const player = root.players[playerId]

	player.socket?.emit('LOAD_UPDATES', {
		type: 'LOAD_UPDATES',
		payload: root.updates,
	})
}

export function* playerSaga() {
	yield* takeEvery('CLIENT_CONNECTED', playerConnectedSaga)
	yield* takeEvery('CLIENT_DISCONNECTED', playerDisconnectedSaga)
	yield* takeEvery('UPDATE_DECK', updateDeckSaga)
	yield* takeEvery('SAVE_DECK', saveDeckSaga)
	yield* takeEvery('UPDATE_MINECRAFT_NAME', updateMinecraftNameSaga)
	yield* takeEvery('GET_UPDATES', loadUpdatesSaga)
}
