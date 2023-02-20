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
import {broadcast} from '../utils'
import gameSaga from './gameLogic'
import {Game} from './game'
import {Root} from './root'

/**
 * @param {Root} root
 * @param {Game} game
 */
function* gameManager(root, game) {
	console.log('Game started. Total games: ', Object.keys(root.allGames).length)

	// Inform users when their opponent is offline & online again
	/*
	// Still needs frontend logic, also don't forget to cancel saga in finally or this saga won't end
	yield takeEvery(
		(action) =>
			['PLAYER_DISCONNECTED', 'PLAYER_RECONNECTED'].includes(action.type) &&
			game.playerIds.includes(action.payload.playerId),
		function* () {
			const connectionStatus = game.playerIds.map(
				(playerId) => !!allPlayers[playerId]?.socket.connected
			)
			broadcast(
				allPlayers,
				game.playerIds,
				'CONNECTION_STATUS',
				connectionStatus
			)
		}
	)
	*/

	const playerIds = Object.keys(game.players)
	const players = Object.values(game.players)

	// Kill game on timeout or when user leaves for long time + cleanup after game
	try {
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
		if (result.timeout) {
			broadcast(players, 'GAME_END', {reason: 'timeout'})
			console.log('Game timed out.')
		} else if (result.playerRemoved) {
			broadcast(players, 'GAME_END', {
				reason: 'player_left',
			})
			console.log('Game killed due to long term player disconnect.')
		} else if (result.forfeit) {
			broadcast(players, 'GAME_END', {
				reason: 'forfeit',
			})
			console.log('Game killed due to player foreit.')
		} else if (result.gameEnd) {
			// For normal win condition the gameSaga itself will send GAME_END with winning info
		}
	} catch (err) {
		console.error('Error: ', err)
		broadcast(players, 'GAME_CRASH')
	} finally {
		yield cancel(game.task)
		delete root.allGames[game.id]
		console.log('Game ended. Total games: ', Object.keys(root.allGames).length)
	}
}

/**
 * @param {Root} root
 * @param {string} playerId
 */
function inGame(root, playerId) {
	return Object.values(root.allGames).some((game) => !!game.players[playerId])
}

/**
 * @param {Root} root
 */
function* randomMatchmaking(root, action) {
	// TODO - use ids from session, these could be fake from client
	const {playerId} = action
	if (inGame(playerId)) return

	const player = root.allPlayers[playerId]

	const randomGame = Object.values(root.allGames).find(
		(game) => game.code === null && !game.task
	)

	if (randomGame) {
		console.log('second player connected, starting game')
		randomGame.players[playerId] = player
		broadcast(randomGame.players, 'GAME_START')

		const gameTask = yield spawn(gameSaga, root, randomGame) // @TODO game saga switch to root or game
		randomGame.task = gameTask
		yield fork(gameManager, root, randomGame)
		return
	}

	// random game not available, create new one
	const newGame = new Game(root, null, [player])
	root.allGames[newGame.id] = newGame

	console.log('Random game created: ', playerId)
}

/**
 * @param {Root} root
 */
function* createPrivateGame(root, action) {
	const {playerId} = action
	if (inGame(playerId)) return

	// create new game with code
	const gameCode = Math.floor(Math.random() * 10000000).toString(16)
	broadcast([root.allPlayers[playerId]], 'PRIVATE_GAME_CODE', gameCode)

	const player = root.allPlayers[playerId]
	const newGame = new Game(root, gameCode, [player])
	root.allGames[newGame.id] = newGame

	console.log('Private game created: ', playerId)
}

/**
 * @param {Root} root
 */
function* joinPrivateGame(root, action) {
	const {playerId, payload: code} = action
	const game = Object.values(root.allGames).find((game) => game.code === code)
	const invalidCode = !game
	const gameRunning = !!game?.task
	console.log('Joining private game: ' + playerId)
	if (invalidCode || gameRunning || inGame(playerId)) {
		broadcast(root.allPlayers[playerId], 'INVALID_CODE')
		return
	}

	game.players[playerId] = root.allPlayers[playerId]

	broadcast(game.players, 'GAME_START')

	const gameTask = yield spawn(gameSaga, root, game)
	game.task = gameTask
	yield fork(gameManager, root, game)
}

/**
 * @param {Root} root
 */
function* leaveMatchmaking(root, action) {
	const playerId =
		action.type === 'LEAVE_MATCHMAKING'
			? action.playerId
			: action.payload.playerId
	const game = Object.values(root.allGames).find(
		(game) => !game.task && !!game.players[playerId]
	)
	if (!game) return
	console.log('Matchmaking cancelled: ', playerId)
	delete root.allGames[game.id]
}

/**
 * @param {Root} root
 */
function* cleanUpSaga(root) {
	while (true) {
		yield delay(1000 * 60)
		for (let gameId in root.allGames) {
			const game = root.allGames[gameId]
			const isRunning = !!game.task
			const isPrivate = !!game.code
			const overFiveMinutes = Date.now() - game.createdTime > 1000 * 60 * 5
			if (!isRunning && isPrivate && overFiveMinutes) {
				delete root.allGames[gameId]
				broadcast(game.players, 'MATCHMAKING_TIMEOUT')
			}
		}
	}
}

/**
 * @param {Root} root
 */
function* matchmakingSaga(root) {
	yield all([
		fork(cleanUpSaga, root),
		takeEvery('RANDOM_MATCHMAKING', randomMatchmaking, root),
		takeEvery('CREATE_PRIVATE_GAME', createPrivateGame, root),
		takeEvery('JOIN_PRIVATE_GAME', joinPrivateGame, root),
		takeEvery(
			['LEAVE_MATCHMAKING', 'PLAYER_DISCONNECTED'],
			leaveMatchmaking,
			root
		),
	])
}

export default matchmakingSaga
