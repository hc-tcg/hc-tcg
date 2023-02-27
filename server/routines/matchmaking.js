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

/**
 * @param {GameModel} game
 */
function* gameManager(game) {
	try {
		console.log('Game started. Total games: ', root.getGameIds().length)

		broadcast(game.getPlayers(), 'GAME_START')
		game.initialize()
		root.hooks.newGame.call(game)
		game.task = yield spawn(gameSaga, game)

		const playerIds = game.getPlayerIds()
		const players = game.getPlayers()

		// Kill game on timeout or when user leaves for long time + cleanup after game
		const result = yield race({
			// game ended (or crashed -> catch)
			gameEnd: join(game.task),
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
			const outcome = getGamePlayerOutcome(game, result, player.playerId)
			broadcast([player], 'GAME_END', {
				gameState: game.state,
				outcome,
				reason: game.endInfo.reason,
			})
		}
		game.endInfo.outcome = getGameOutcome(game, result)
		game.endInfo.winner = getWinner(game, result)
	} catch (err) {
		console.error('Error: ', err)
		game.endInfo.outcome = 'error'
		broadcast(game.getPlayers(), 'GAME_CRASH')
	} finally {
		yield cancel(game.task)
		delete root.games[game.id]
		root.hooks.gameRemoved.call(game)
		console.log('Game ended. Total games: ', root.getGameIds().length)
	}
}

/**
 * @param {string} playerId
 */
function inGame(playerId) {
	return root.getGames().some((game) => !!game.players[playerId])
}

function* randomMatchmaking(action) {
	// TODO - use ids from session, these could be fake from client
	const {playerId} = action
	const player = root.players[playerId]
	if (!player) {
		console.log('[Random matchmaking] Player not found: ', playerId)
		return
	}
	if (inGame(playerId)) return

	const randomGame = root
		.getGames()
		.find((game) => game.code === null && !game.task)

	if (randomGame) {
		console.log('second player connected, starting game')
		randomGame.addPlayer(player)
		yield fork(gameManager, randomGame)
		return
	}

	// random game not available, create new one
	const newGame = new GameModel()
	newGame.addPlayer(player)
	root.addGame(newGame)

	console.log('Random game created: ', playerId, player.playerName)
}

function* createPrivateGame(action) {
	const {playerId} = action
	const player = root.players[playerId]
	if (!player) {
		console.log('[Create Game] Player not found: ', playerId)
		return
	}
	if (inGame(playerId)) return

	// create new game with code
	const gameCode = Math.floor(Math.random() * 10000000).toString(16)
	broadcast([player], 'PRIVATE_GAME_CODE', gameCode)

	const newGame = new GameModel(gameCode)
	newGame.addPlayer(player)
	root.games[newGame.id] = newGame

	console.log('Private game created: ', playerId, player.playerName)
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
	console.log('Joining private game: ', playerId, player.playerName)
	if (invalidCode || gameRunning || inGame(playerId)) {
		broadcast([player], 'INVALID_CODE')
		return
	}

	game.addPlayer(player)
	yield fork(gameManager, game)
}

function* leaveMatchmaking(action) {
	const playerId =
		action.type === 'LEAVE_MATCHMAKING'
			? action.playerId
			: action.payload.playerId
	const game = root
		.getGames()
		.find((game) => !game.task && !!game.players[playerId])
	if (!game) return
	console.log('Matchmaking cancelled: ', playerId)
	delete root.games[game.id]
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

function* matchmakingSaga() {
	yield all([
		fork(cleanUpSaga),
		takeEvery('RANDOM_MATCHMAKING', randomMatchmaking),
		takeEvery('CREATE_PRIVATE_GAME', createPrivateGame),
		takeEvery('JOIN_PRIVATE_GAME', joinPrivateGame),
		takeEvery(['LEAVE_MATCHMAKING', 'PLAYER_DISCONNECTED'], leaveMatchmaking),
	])
}

export default matchmakingSaga
