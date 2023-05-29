import {
	all,
	take,
	takeEvery,
	join,
	cancel,
	spawn,
	fork,
	race,
	delay,
} from 'redux-saga/effects'
import {broadcast} from '../utils/comm'
import gameSaga from './game'
import root from '../models/root-model'
import {GameModel} from '../models/game-model'
import {
	getGamePlayerOutcome,
	getWinner,
	getGameOutcome,
} from '../utils/win-conditions'
import {getLocalGameState} from '../utils/state-gen'
import { gameEndWebhook } from '../api'

/**
 * @typedef {import("redux-saga").Task} Task
 */

/**
 * @param {GameModel} game
 */
function* gameManager(game) {
	try {
		const playerIds = game.getPlayerIds()
		const players = game.getPlayers()

		const gameType = game.code ? 'Private' : 'Public'
		console.log(
			`${gameType} game started.`,
			`Players: ${players[0].playerName} + ${players[1].playerName}.`,
			'Total games:',
			root.getGameIds().length
		)

		broadcast(players, 'GAME_START')
		game.initialize()
		root.hooks.newGame.call(game)
		game.task = yield spawn(gameSaga, game)

		// Kill game on timeout or when user leaves for long time + cleanup after game
		const result = yield race({
			// game ended (or crashed -> catch)
			gameEnd: join(/** @type {Task} */ (game.task)),
			// kill a game after two hours
			timeout: delay(1000 * 60 * 60),
			// kill game when a player is disconnected for too long
			playerRemoved: take(
				(action) =>
					action.type === 'PLAYER_REMOVED' &&
					playerIds.includes(action.payload.playerId)
			),
			forfeit: take(
				(action) =>
					action.type === 'FORFEIT' && playerIds.includes(action.playerId)
			),
		})

		for (const player of players) {
			const gameState = getLocalGameState(game, player)
			const outcome = getGamePlayerOutcome(game, result, player.playerId)
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
		if (game.task) yield cancel(game.task)

		const gameType = game.code ? 'Private' : 'Public'
		console.log(
			`${gameType} game ended. Total games:`,
			root.getGameIds().length - 1
		)
		gameEndWebhook(game)

		delete root.games[game.id]
		root.hooks.gameRemoved.call(game)
	}
}

/**
 * @param {string} playerId
 */
function inGame(playerId) {
	return root.getGames().some((game) => !!game.players[playerId])
}

/**
 * @param {string} playerId
 */
function inQueue(playerId) {
	return root.queue.some((id) => id === playerId)
}

function* joinQueue(action) {
	// TODO - use ids from session, these could be fake from client
	const {playerId} = action
	const player = root.players[playerId]
	if (!player) {
		console.log('[Random matchmaking] Player not found: ', playerId)
		return
	}
	if (inGame(playerId) || inQueue(playerId)) return
	root.queue.push(playerId)
	console.log(`Joining queue: ${player.playerName}`)
}

function* leaveMatchmaking(action) {
	const playerId =
		action.type === 'LEAVE_MATCHMAKING'
			? action.playerId
			: action.payload.playerId

	const queueIndex = root.queue.indexOf(playerId)
	if (queueIndex >= 0) {
		root.queue.splice(queueIndex, 1)
	} else {
		const game = root
			.getGames()
			.find((game) => !game.task && !!game.players[playerId])
		if (!game) return
		delete root.games[game.id]
	}
	console.log(
		'Matchmaking cancelled: ',
		root.players[playerId]?.playerName || 'Unknown'
	)
}

function* createPrivateGame(action) {
	const {playerId} = action
	const player = root.players[playerId]
	if (!player) {
		console.log('[Create Game] Player not found: ', playerId)
		return
	}
	if (inGame(playerId) || inQueue(playerId)) return

	// Create new game with code
	const gameCode = Math.floor(Math.random() * 10000000).toString(16)
	broadcast([player], 'PRIVATE_GAME_CODE', gameCode)

	const newGame = new GameModel(gameCode)
	newGame.addPlayer(player)
	root.games[newGame.id] = newGame

	console.log(
		`Private game created by ${player.playerName}.`,
		`Code: ${gameCode}`
	)
}

function* joinPrivateGame(action) {
	const {playerId, payload: code} = action
	const player = root.players[playerId]
	if (!player) {
		console.log('[Join Game] Player not found: ', playerId)
		return
	}
	const game = root.getGames().find((game) => game.code === code)
	const invalidCode = !game
	const gameRunning = !!game?.task
	if (invalidCode || gameRunning || inGame(playerId)) {
		broadcast([player], 'INVALID_CODE')
		return
	}

	console.log(`Joining private game: ${player.playerName}.`, `Code: ${code}`)
	game.addPlayer(player)
	yield fork(gameManager, game)
}

function* cleanUpSaga() {
	while (true) {
		yield delay(1000 * 60)
		for (let gameId in root.games) {
			const game = root.games[gameId]
			const isRunning = !!game.task
			const isPrivate = !!game.code
			const overFiveMinutes = Date.now() - game.createdTime > 1000 * 60 * 5
			if (!isRunning && isPrivate && overFiveMinutes) {
				delete root.games[gameId]
				broadcast(game.getPlayers(), 'MATCHMAKING_TIMEOUT')
			}
		}
	}
}

function* randomMatchmakingSaga() {
	while (true) {
		// Wait 3 seconds
		yield delay(1000 * 3)
		if (!(root.queue.length > 1)) continue

		const extraPlayer =
			root.queue.length % 2 === 1 ? root.queue.pop() || null : null

		// Shuffle
		for (var i = root.queue.length - 1; i > 0; i--) {
			var randomPos = Math.floor(Math.random() * (i + 1))
			var oldValue = root.queue[i]
			root.queue[i] = root.queue[randomPos]
			root.queue[randomPos] = oldValue
		}

		let index
		for (index = 0; index < root.queue.length; index += 2) {
			const player1 = root.players[root.queue[index]]
			const player2 = root.players[root.queue[index + 1]]

			// Create a new game for these players
			const newGame = new GameModel()
			newGame.addPlayer(player1)
			newGame.addPlayer(player2)
			root.addGame(newGame)
			yield fork(gameManager, newGame)
		}

		// Add back extra player
		if (extraPlayer) {
			root.queue.push(extraPlayer)
		}

		// Remove players who got games from queue
		root.queue.splice(0, index)
	}
}

function* matchmakingSaga() {
	yield all([
		fork(cleanUpSaga),
		fork(randomMatchmakingSaga),
		takeEvery('RANDOM_MATCHMAKING', joinQueue),
		takeEvery('CREATE_PRIVATE_GAME', createPrivateGame),
		takeEvery('JOIN_PRIVATE_GAME', joinPrivateGame),
		takeEvery(['LEAVE_MATCHMAKING', 'PLAYER_DISCONNECTED'], leaveMatchmaking),
	])
}

export default matchmakingSaga
