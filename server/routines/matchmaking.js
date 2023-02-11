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

const createGameRecord = (id, task, playerIds) => ({
	createdTime: Date.now(),
	id,
	task,
	playerIds,
	code: null,
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

function* randomMatchmaking(allPlayers) {
	while (true) {
		const firstRequest = yield take('RANDOM_MATCHMAKING')
		console.log('first player waiting')
		const result = yield take([
			'RANDOM_MATCHMAKING',
			(action) =>
				action.type === 'LEAVE_MATCHMAKING' &&
				firstRequest.playerId === action.playerId,
			(action) =>
				action.type === 'PLAYER_DISCONNECTED' &&
				firstRequest.socket === action.payload.socket,
		])
		// TODO - use ids from session, these could be fake from client
		if (result.type === 'RANDOM_MATCHMAKING') {
			console.log('second player connected, starting game')
			// TODO - use singleton for all players map instead?
			const gameId = Math.random().toString()
			const playerIds = [firstRequest.playerId, result.playerId]
			broadcast(allPlayers, playerIds, 'GAME_START')
			const gameTask = yield spawn(gameSaga, allPlayers, playerIds)
			games[gameId] = createGameRecord(gameId, gameTask, playerIds)
			yield fork(gameManager, allPlayers, gameId)
		} else {
			console.log('Random matchmaking cancelled: ', result.type)
		}
	}
}

function* createPrivateGame(allPlayers, action) {
	const firstRequest = action
	const gameCode = Math.floor(Math.random() * 10000000).toString(16)
	broadcast(allPlayers, [firstRequest.playerId], 'PRIVATE_GAME_CODE', gameCode)

	console.log('Private game created: ', firstRequest.playerId)

	const gameId = Math.random().toString()
	games[gameId] = {
		id: gameId,
		code: gameCode,
		playerIds: [firstRequest.playerId],
	}
}

function* joinPrivateGame(allPlayers, action) {
	const {playerId, payload: code} = action
	const game = Object.values(games).find((game) => game.code === code)
	const invalidCode = !game
	const gameRunning = !!game?.task
	const differentPlayers = playerId !== game?.playerIds[0]
	console.log(
		'Joining private game: ' +
			playerId +
			' ' +
			invalidCode.toString() +
			' ' +
			gameRunning.toString() +
			' ' +
			differentPlayers.toString()
	)
	if (invalidCode || gameRunning || !differentPlayers) {
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
	console.log('Private game cancelled: ', playerId)
	delete games[game.id]
}

// TODO - check cleanups
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
		fork(randomMatchmaking, allPlayers),
		fork(cleanUpSaga, allPlayers),
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
