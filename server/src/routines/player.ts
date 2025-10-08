import {ACHIEVEMENTS} from 'common/achievements'
import {CONFIG} from 'common/config'
import {COSMETICS} from 'common/cosmetics'
import {Background, Border, Coin, Heart, Title} from 'common/cosmetics/types'
import {PlayerModel} from 'common/models/player-model'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {assert} from 'common/utils/assert'
import {censorString} from 'common/utils/formatting'
import {
	getAchievementProgress,
	setAppearance,
	setMinecraftName,
	setUsername,
} from 'db/db-reciever'
import {LocalMessage, LocalMessageTable, localMessages} from 'messages'
import {getGame} from 'selectors'
import {delay, put, race, select, take} from 'typed-redux-saga'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'

const KEEP_PLAYER_AFTER_DISCONNECT_MS = 1000 * 60

export function* playerConnectedSaga(
	action: LocalMessageTable[typeof localMessages.CLIENT_CONNECTED],
) {
	const {playerName, minecraftName, playerUuid, deck, appearance, socket} =
		action

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
			const game = yield* select(getGame(existingPlayer.id))
			assert(game, 'If they are reconnecting, the player should be in a game')
			console.log('broadcasting reconnect to game info')
			broadcast([existingPlayer], {
				type: serverMessages.PLAYER_RECONNECTED,
				...game.getGamePropsForPlayer(existingPlayer.id)
			})
		} else {
			const time = Date.now()
			const date = new Date(time)
			console.info(
				`${date.toLocaleTimeString('it-IT')}: Invalid player connected.`,
			)
			broadcast([{socket}], {type: serverMessages.INVALID_PLAYER})
		}
		return
	}

	const achievementProgress = root.db.connected
		? yield* getAchievementProgress(playerUuid)
		: {}

	const newPlayer = new PlayerModel(
		playerName,
		minecraftName,
		playerUuid,
		appearance,
		achievementProgress,
		socket,
	)
	if (deck) newPlayer.setPlayerDeck(deck)
	root.addPlayer(newPlayer)

	root.hooks.playerJoined.call(newPlayer)
	yield* put<LocalMessage>({
		type: localMessages.PLAYER_CONNECTED,
		player: newPlayer,
	})

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

export function* updateUsernameSaga(
	action: RecievedClientMessage<typeof clientMessages.UPDATE_USERNAME>,
) {
	const {playerId} = action
	let username = action.payload.name
	const player = root.players[playerId]
	if (!player) return
	player.name = username
	player.censoredName = censorString(username)

	yield* setUsername(player.uuid, username)
}

export function* updateMinecraftNameSaga(
	action: RecievedClientMessage<typeof clientMessages.UPDATE_MINECRAFT_NAME>,
) {
	const {playerId} = action
	let minecraftName = action.payload.name
	const player = root.players[playerId]
	if (!player) return
	player.minecraftName = minecraftName

	yield* setMinecraftName(player.uuid, minecraftName)
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

export function* updateCosmeticSaga(
	action: RecievedClientMessage<typeof clientMessages.SET_COSMETIC>,
) {
	const player = root.players[action.playerId]
	const cosmetic = COSMETICS[action.payload.cosmetic]
	if (!player) return
	let isUnlocked = true
	if (cosmetic?.requires && ACHIEVEMENTS[cosmetic?.requires.achievement]) {
		const achievement = ACHIEVEMENTS[cosmetic?.requires.achievement]
		isUnlocked =
			!!player.achievementProgress[achievement?.numericId]?.levels[
				cosmetic.requires.level || 0
			]
	}
	if (CONFIG.unlockAllCosmetics) isUnlocked = true
	if (!cosmetic || !isUnlocked) {
		broadcast([player], {type: serverMessages.COSMETICS_INVALID})
	}
	switch (cosmetic.type) {
		case 'title':
			player.appearance.title = cosmetic as Title
			break
		case 'coin':
			player.appearance.coin = cosmetic as Coin
			break
		case 'heart':
			player.appearance.heart = cosmetic as Heart
			break
		case 'background':
			player.appearance.background = cosmetic as Background
			break
		case 'border':
			player.appearance.border = cosmetic as Border
			break
	}
	yield* setAppearance(player)
	broadcast([player], {
		type: serverMessages.COSMETICS_UPDATE,
		appearance: player.appearance,
	})
}
