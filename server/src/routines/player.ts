import {PlayerModel} from 'common/models/player-model'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessage, LocalMessageTable, localMessages} from 'messages'
import {delay, put, race, take} from 'typed-redux-saga'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'

const KEEP_PLAYER_AFTER_DISCONNECT_MS = 1000 * 30

export function* playerConnectedSaga(
	action: LocalMessageTable[typeof localMessages.CLIENT_CONNECTED],
) {
	const {playerName, minecraftName, deck, socket} = action

	if (action.playerId) {
		const existingPlayer = root.players[action.playerId]
		const validPlayer = existingPlayer?.secret === action.playerSecret

		if (validPlayer) {
			existingPlayer.socket = socket
			if (deck) existingPlayer.setPlayerDeck(deck)
			yield* put<LocalMessage>({
				type: localMessages.PLAYER_RECONNECTED,
				player: existingPlayer,
			})
			broadcast([existingPlayer], {type: serverMessages.PLAYER_RECONNECTED})
		} else {
			console.log('invalid player connected')
			broadcast([{socket}], {type: serverMessages.INVALID_PLAYER})
		}
		return
	}

	const newPlayer = new PlayerModel(playerName, minecraftName, socket)
	if (deck) newPlayer.setPlayerDeck(deck)
	root.addPlayer(newPlayer)

	root.hooks.playerJoined.call(newPlayer)
	yield* put<LocalMessage>({
		type: localMessages.PLAYER_CONNECTED,
		player: newPlayer,
	})

	yield* delay(500)

	broadcast([newPlayer], {
		type: serverMessages.PLAYER_INFO,
		player: newPlayer.getPlayerInfo(),
	})
}

export function* playerDisconnectedSaga(
	action: LocalMessageTable[typeof localMessages.CLIENT_DISCONNECTED],
) {
	const {socket} = action

	const player = root.getPlayers().find((player) => player.socket === socket)
	if (!player) return
	const {id: playerId} = player

	// Remove player from queues straight away
	root.hooks.playerLeft.call(player)

	yield* put<LocalMessage>({type: localMessages.PLAYER_DISCONNECTED, player})

	const result = yield* race({
		timeout: delay(KEEP_PLAYER_AFTER_DISCONNECT_MS),
		reconnect: take(
			(action: any) =>
				action.type === localMessages.PLAYER_RECONNECTED &&
				action.player.id === playerId,
		),
	})

	if (result.timeout) {
		yield* put<LocalMessage>({type: localMessages.PLAYER_REMOVED, player}) // @TODO will we try to get playerId here after instance is deleted?
		delete root.players[playerId]
	}
}

export function* updateDeckSaga(
	action: RecievedClientMessage<typeof clientMessages.UPDATE_DECK>,
) {
	const {playerId} = action
	let playerDeck = action.payload.deck
	const player = root.players[playerId]
	if (!player) return
	player.setPlayerDeck(playerDeck)

	broadcast([player], {type: serverMessages.NEW_DECK, deck: player.deck})
}

export function* updateMinecraftNameSaga(
	action: RecievedClientMessage<typeof clientMessages.UPDATE_MINECRAFT_NAME>,
) {
	const {playerId} = action
	let minecraftName = action.payload.name
	const player = root.players[playerId]
	if (!player) return
	player.setMinecraftName(minecraftName)

	broadcast([player], {
		type: serverMessages.NEW_MINECRAFT_NAME,
		name: player.minecraftName,
	})
}

export function* loadUpdatesSaga(action: any) {
	const {playerId} = action
	const player = root.players[playerId]

	if (!player) {
		console.error('Found undefined player with id:', player)
		return
	}

	broadcast([player], {
		type: serverMessages.LOAD_UPDATES,
		updates: root.updates,
	})
}
