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
import gameSaga from './game'

const games = Object.create(null)

const createGameRecord = (id, code, playerIds) => ({
	createdTime: Date.now(),
	id,
	code,
	playerIds,
	task: null,
})

const broadcast = (allPlayers, playerIds, type, payload = {}) => {
	playerIds.forEach((playerId) => {
		const playerSocket = allPlayers[playerId]?.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(type, {type: type, payload})
		}
	})
}

function* gameManager(allPlayers, gameId) {
	console.log('Game started. Total games: ', Object.keys(games).length)
	const game = games[gameId]

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

	// Kill game on timeout or when user leaves for long time + cleanup after game
	try {
		const result = yield race({
			// game ended (or crashed -> catch)
			gameEnd: join(games[gameId].task),
			// kill a game after two hours
			timeout: delay(1000 * 60 * 60),
			// kill game when a player is disconnected for too long
			playerRemoved: take(
				(action) =>
					action.type === 'PLAYER_REMOVED' &&
					game.playerIds.includes(action.payload.playerId)
			),
			forfeit: take(
				(action) =>
					action.type === 'FORFEIT' && game.playerIds.includes(action.playerId)
			),
		})
		if (result.timeout) {
			broadcast(allPlayers, game.playerIds, 'GAME_END', {reason: 'timeout'})
			console.log('Game timed out.')
		} else if (result.playerRemoved) {
			broadcast(allPlayers, game.playerIds, 'GAME_END', {
				reason: 'player_left',
			})
			console.log('Game killed due to long term player disconnect.')
		} else if (result.forfeit) {
			broadcast(allPlayers, game.playerIds, 'GAME_END', {
				reason: 'forfeit',
			})
			console.log('Game killed due to player foreit.')
		} else if (result.gameEnd) {
			// For normal win condition the gameSaga itself will send GAME_END with winning info
		}
	} catch (err) {
		console.error('Error: ', err)
		broadcast(allPlayers, game.playerIds, 'GAME_CRASH')
	} finally {
		yield cancel(games[gameId].task)
		delete games[gameId]
		console.log('Game ended. Total games: ', Object.keys(games).length)
	}
}

const inGame = (playerId) => {
	return Object.values(games).some((game) => game.playerIds.includes(playerId))
}

// TODO - use ids from session, these could be fake from client
function* randomMatchmaking(allPlayers, action) {
	const {playerId} = action
	if (inGame(playerId)) return

	const randomGame = Object.values(games).find(
		(game) => game.code === null && !game.task
	)

	if (randomGame) {
		console.log('second player connected, starting game')
		randomGame.playerIds.push(playerId)
		broadcast(allPlayers, randomGame.playerIds, 'GAME_START')

		const gameTask = yield spawn(gameSaga, allPlayers, randomGame.playerIds)
		randomGame.task = gameTask
		yield fork(gameManager, allPlayers, randomGame.id)
		return
	}

	console.log('Random game created: ', playerId)
	const gameId = Math.random().toString()
	games[gameId] = createGameRecord(gameId, null, [playerId])
}

function* createPrivateGame(allPlayers, action) {
	const {playerId} = action
	if (inGame(playerId)) return
	const gameCode = Math.floor(Math.random() * 10000000).toString(16)
	broadcast(allPlayers, [playerId], 'PRIVATE_GAME_CODE', gameCode)

	console.log('Private game created: ', playerId)

	const gameId = Math.random().toString()
	games[gameId] = createGameRecord(gameId, gameCode, [playerId])
}

function* joinPrivateGame(allPlayers, action) {
	const {playerId, payload: code} = action
	const game = Object.values(games).find((game) => game.code === code)
	const invalidCode = !game
	const gameRunning = !!game?.task
	console.log('Joining private game: ' + playerId)
	if (invalidCode || gameRunning || inGame(playerId)) {
		broadcast(allPlayers, [playerId], 'INVALID_CODE')
		return
	}
	game.playerIds.push(playerId)
	broadcast(allPlayers, game.playerIds, 'GAME_START')

	const gameTask = yield spawn(gameSaga, allPlayers, game.playerIds)
	game.task = gameTask
	yield fork(gameManager, allPlayers, game.id)
}

function* leaveMatchmaking(allPlayers, action) {
	const playerId =
		action.type === 'LEAVE_MATCHMAKING'
			? action.playerId
			: action.payload.playerId
	const game = Object.values(games).find(
		(game) => !game.task && game.playerIds.includes(playerId)
	)
	if (!game) return
	console.log('Matchmaking cancelled: ', playerId)
	delete games[game.id]
}

function* cleanUpSaga(allPlayers) {
	while (true) {
		yield delay(1000 * 60)
		for (let gameId in games) {
			const game = games[gameId]
			const isRunning = !!game.task
			const isPrivate = !!game.code
			const overFiveMinutes = Date.now() - game.createdTime > 1000 * 60 * 5
			if (!isRunning && isPrivate && overFiveMinutes) {
				delete games[gameId]
				broadcast(allPlayers, game.playerIds, 'MATCHMAKING_TIMEOUT')
			}
		}
	}
}

function* matchmakingSaga(allPlayers) {
	yield all([
		fork(cleanUpSaga, allPlayers),
		takeEvery('RANDOM_MATCHMAKING', randomMatchmaking, allPlayers),
		takeEvery('CREATE_PRIVATE_GAME', createPrivateGame, allPlayers),
		takeEvery('JOIN_PRIVATE_GAME', joinPrivateGame, allPlayers),
		takeEvery(
			['LEAVE_MATCHMAKING', 'PLAYER_DISCONNECTED'],
			leaveMatchmaking,
			allPlayers
		),
	])
}

export default matchmakingSaga
