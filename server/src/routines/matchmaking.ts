import {all, take, takeEvery, cancel, spawn, fork, race, delay, join} from 'typed-redux-saga'
import {broadcast} from '../utils/comm'
import gameSaga, {getTimerForSeconds} from './game'
import {GameModel} from 'common/models/game-model'
import {getGamePlayerOutcome, getWinner, getGameOutcome} from '../utils/win-conditions'
import {getLocalGameState} from '../utils/state-gen'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import root from '../serverRoot'
import {VirtualPlayerModel} from 'common/models/virtual-player-model'
import {CARDS} from 'common/cards'
import {BoardSlotComponent, PlayerComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {slotEntity} from 'common/components/query/card'
import {WithoutFunctions} from 'common/types/server-requests'
import {CardEntity, newEntity} from 'common/entities'

export type ClientMessage = {
	type: string
	playerId: PlayerId
	playerSecret: string
	payload?: any
}

function* gameManager(game: GameModel) {
	// @TODO this one method needs cleanup still
	try {
		const playerIds = game.getPlayerIds()
		const players = game.getPlayers()

		const gameType = players.every((p) => p.socket) ? (game.code ? 'Private' : 'Public') : 'PvE'
		console.log(
			`${gameType} game started.`,
			`Players: ${players[0].name} + ${players[1].name}.`,
			'Total games:',
			root.getGameIds().length
		)

		broadcast(players, 'GAME_START')
		root.hooks.newGame.call(game)
		game.task = yield* spawn(gameSaga, game)

		// Kill game on timeout or when user leaves for long time + cleanup after game
		const result = yield* race({
			// game ended (or crashed -> catch)
			gameEnd: join(game.task),
			// kill a game after two hours
			timeout: delay(1000 * 60 * 60),
			// kill game when a player is disconnected for too long
			playerRemoved: take(
				(action: any) => action.type === 'PLAYER_REMOVED' && playerIds.includes(action.payload.id)
			),
			forfeit: take(
				(action: any) => action.type === 'FORFEIT' && playerIds.includes(action.playerId)
			),
		})

		for (const player of players) {
			const gameState = getLocalGameState(game, player)
			if (gameState) {
				gameState.timer.turnRemaining = 0
				gameState.timer.turnStartTime = getTimerForSeconds(0)
			}
			const outcome = getGamePlayerOutcome(game, result, player.id)
			broadcast([player], 'GAME_END', {
				gameState,
				outcome,
				reason: game.endInfo.reason,
			})
		}
		game.endInfo.outcome = getGameOutcome(game, result)
		game.endInfo.winner = getWinner(game, result)
	} catch (err) {
		console.log('Error: ', err)
		game.endInfo.outcome = 'error'
		broadcast(game.getPlayers(), 'GAME_CRASH')
	} finally {
		if (game.task) yield* cancel(game.task)
		game.afterGameEnd.call()

		const gameType = game.code ? 'Private' : 'Public'
		console.log(`${gameType} game ended. Total games:`, root.getGameIds().length - 1)

		delete root.games[game.id]
		root.hooks.gameRemoved.call(game)
	}
}

export function inGame(playerId: PlayerId) {
	return root.getGames().some((game) => !!game.players[playerId])
}

export function inQueue(playerId: string) {
	return (
		root.queue.some((id) => id === playerId) ||
		Object.keys(root.privateQueue).some((id) => id === playerId)
	)
}

function* randomMatchmakingSaga() {
	while (true) {
		yield* delay(1000 * 3)
		if (!(root.queue.length > 1)) continue

		// Shuffle
		for (var i = root.queue.length - 1; i > 0; i--) {
			var randomPos = Math.floor(Math.random() * (i + 1))
			var oldValue = root.queue[i]
			root.queue[i] = root.queue[randomPos]
			root.queue[randomPos] = oldValue
		}

		const playersToRemove: Array<string> = []

		for (let index = 0; index < root.queue.length - 1; index += 2) {
			const player1Id = root.queue[index]
			const player2Id = root.queue[index + 1]
			const player1 = root.players[player1Id]
			const player2 = root.players[player2Id]

			if (player1 && player2) {
				playersToRemove.push(player1.id, player2.id)
				const newGame = new GameModel(player1, player2)
				root.addGame(newGame)
				yield* fork(gameManager, newGame)
			} else {
				// Something went wrong, remove the undefined player from the queue
				if (player1 === undefined) playersToRemove.push(player1Id)
				if (player2 === undefined) playersToRemove.push(player2Id)
			}
		}

		root.queue = root.queue.filter((player) => !playersToRemove.includes(player))
	}
}

function* cleanUpSaga() {
	// Clean up private games that have been around longer than 10 minutes
	while (true) {
		yield* delay(1000 * 30)
		for (let code in root.privateQueue) {
			const info = root.privateQueue[code]
			const overTenMinutes = Date.now() - info.createdTime > 1000 * 60 * 10
			if (overTenMinutes) {
				if (info.playerId) {
					const player = root.players[info.playerId]
					if (player) {
						broadcast([player], 'PRIVATE_GAME_TIMEOUT')
					}
				}
				delete root.privateQueue[code]
			}
		}
	}
}

function* joinQueue(msg: ClientMessage) {
	const {playerId} = msg
	const player = root.players[playerId]

	if (!player) {
		console.log('[Join queue] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log('[Join queue] Player is already in game or queue:', player.name)
		broadcast([player], 'JOIN_QUEUE_FAILURE')
		return
	}

	// Add them to the queue
	root.queue.push(playerId)
	broadcast([player], 'JOIN_QUEUE_SUCCESS')
	console.log(`Joining queue: ${player.name}`)
}

function* leaveQueue(msg: ClientMessage) {
	const {playerId} = msg
	const player = root.players[playerId]

	if (!player) {
		console.log('[Leave queue] Player not found: ', playerId)
		return
	}

	// Remove them from the queue
	const queueIndex = root.queue.indexOf(playerId)
	if (queueIndex >= 0) {
		root.queue.splice(queueIndex, 1)
		broadcast([player], 'LEAVE_QUEUE_SUCCESS')
		console.log(`Left queue: ${player.name}`)
	} else {
		broadcast([player], 'LEAVE_QUEUE_FAILURE')
		console.log('[Leave queue]: Player tried to leave queue when not there:', player.name)
	}
}

function* createBossGame(msg: ClientMessage) {
	const {playerId} = msg
	const player = root.players[playerId]
	if (!player) {
		console.log('[Create Boss game] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log('[Create Boss game] Player is already in game or queue:', player.name)
		broadcast([player], 'CREATE_BOSS_GAME_FAILURE')
		return
	}

	broadcast([player], 'CREATE_BOSS_GAME_SUCCESS')

	const EX_BOSS_PLAYER = new VirtualPlayerModel('EX', 'EvilXisuma', 'evilxisuma_boss')
	EX_BOSS_PLAYER.deck.cards = [
		{
			props: WithoutFunctions(CARDS['evilxisuma_boss'].props),
			entity: newEntity('card-entity') as CardEntity,
			slot: null,
			turnedOver: false,
			attackHint: null,
		},
	]

	const newBossGame = new GameModel(player, EX_BOSS_PLAYER, 'BOSS')
	newBossGame.state.isBossGame = true
	if (newBossGame.opponentPlayer.id !== playerId) {
		newBossGame.state.order.reverse()
	}

	function destroyRow(row: RowComponent) {
		newBossGame.components
			.filterEntities(BoardSlotComponent, query.slot.rowIs(row.entity))
			.forEach((slotEntity) => newBossGame.components.delete(slotEntity))
		newBossGame.components.delete(row.entity)
	}

	// Remove challenger's rows other than indexes 0, 1, and 2
	newBossGame.components
		.filter(RowComponent, query.row.opponentPlayer, (_game, row) => row.index > 2)
		.forEach(destroyRow)
	// Remove boss' rows other than index 0
	newBossGame.components
		.filter(RowComponent, query.row.currentPlayer, query.not(query.row.index(0)))
		.forEach(destroyRow)
	// Remove boss' item slots
	newBossGame.components
		.filterEntities(BoardSlotComponent, query.slot.currentPlayer, query.slot.item)
		.forEach((slotEntity) => newBossGame.components.delete(slotEntity))

	newBossGame.rules = {
		disableRewardCards: true,
		disableVirtualDeckOut: true,
	}

	root.addGame(newBossGame)

	yield* fork(gameManager, newBossGame)
}

function* createPrivateGame(msg: ClientMessage) {
	const {playerId} = msg
	const player = root.players[playerId]
	if (!player) {
		console.log('[Create private game] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log('[Create private game] Player is already in game or queue:', player.name)
		broadcast([player], 'CREATE_PRIVATE_GAME_FAILURE')
		return
	}

	// Add to private queue with code
	const gameCode = Math.floor(Math.random() * 10000000).toString(16)
	root.privateQueue[gameCode] = {
		createdTime: Date.now(),
		playerId,
	}

	// Send code to player
	broadcast([player], 'CREATE_PRIVATE_GAME_SUCCESS', gameCode)

	console.log(`Private game created by ${player.name}.`, `Code: ${gameCode}`)
}

function* joinPrivateGame(msg: ClientMessage) {
	const {playerId, payload: code} = msg
	const player = root.players[playerId]
	if (!player) {
		console.log('[Join private game] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log('[Join private game] Player is already in game or queue:', player.name)
		broadcast([player], 'JOIN_PRIVATE_GAME_FAILURE')
		return
	}

	// Find the code in the private queue
	const info = root.privateQueue[code]
	if (!info) {
		broadcast([player], 'INVALID_CODE')
		return
	}

	// If there is another player, start game, otherwise, add us to queue
	if (info.playerId) {
		// Create new game for these 2 players
		const existingPlayer = root.players[info.playerId]
		if (!existingPlayer) {
			console.log('[Join private game]: Player waiting in queue no longer exists! Code: ' + code)
			delete root.privateQueue[code]

			broadcast([player], 'JOIN_PRIVATE_GAME_FAILURE')
			return
		}

		const newGame = new GameModel(player, existingPlayer, code)
		root.addGame(newGame)

		// Remove this game from the queue, it's started
		delete root.privateQueue[code]

		console.log(`Joining private game: ${player.name}.`, `Code: ${code}`)

		broadcast([player], 'JOIN_PRIVATE_GAME_SUCCESS')
		yield* fork(gameManager, newGame)
	} else {
		// Assign this player to the game
		root.privateQueue[code].playerId = playerId
		broadcast([player], 'WAITING_FOR_PLAYER')

		console.log(`Joining empty private game: ${player.name}.`, `Code: ${code}`)
	}
}

function* cancelPrivateGame(msg: ClientMessage) {
	const {playerId} = msg

	for (let code in root.privateQueue) {
		const info = root.privateQueue[code]
		if (info.playerId && info.playerId === playerId) {
			const player = root.players[info.playerId]
			if (player) {
				broadcast([player], 'PRIVATE_GAME_CANCELLED')
			}

			root.hooks.privateCancelled.call(code)
			delete root.privateQueue[code]
			console.log(`Private game cancelled. Code: ${code}`)
		}
	}
}

function onPlayerLeft(player: PlayerModel) {
	// Remove player from all queues

	// Public queue
	if (root.queue.some((id) => id === player.id)) {
		const queueIndex = root.queue.indexOf(player.id)
		if (queueIndex >= 0) {
			root.queue.splice(queueIndex, 1)
			console.log(`Left queue: ${player.name}`)
		}
	}

	// Private queue
	for (let code in root.privateQueue) {
		const info = root.privateQueue[code]
		if (info.playerId && info.playerId === player.id) {
			delete root.privateQueue[code]
			console.log(`Private game cancelled. Code: ${code}`)
		}
	}
}

function* matchmakingSaga() {
	root.hooks.playerLeft.add('matchmaking', onPlayerLeft)

	yield* all([
		fork(randomMatchmakingSaga),
		fork(cleanUpSaga),

		takeEvery('JOIN_QUEUE', joinQueue),
		takeEvery('LEAVE_QUEUE', leaveQueue),

		takeEvery('CREATE_PRIVATE_GAME', createPrivateGame),
		takeEvery('CREATE_BOSS_GAME', createBossGame),
		takeEvery('JOIN_PRIVATE_GAME', joinPrivateGame),
		takeEvery('CANCEL_PRIVATE_GAME', cancelPrivateGame),
	])
}

/*
 receive: CANCEL_PRIVATE_GAME
 send: WAITING_FOR_PLAYER, JOIN_PRIVATE_GAME_SUCCESS, JOIN_PRIVATE_GAME_FAILURE, CREATE_PRIVATE_GAME_FAILURE, CREATE_PRIVATE_GAME_SUCCESS (with code)
 */

// client sends join queue
// we send back join queue success or fail, and client acts accordingly

// 2 things happening at the same time when action is dispatched to store:
// 1) reducer receives action and updates matchmaking state, therefore changing the client look to show - waiting for public game
// 2) matchmaking saga also receives action, and sends data to client, then waiting for the game to start

// send and receive nessage is how we communicate with the server,completely independent of the store and reducer

export default matchmakingSaga
