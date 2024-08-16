import {PlayerComponent} from 'common/components'
import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel, gameSettingsFromEnv} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessageTable, localMessages} from 'messages'
import {
	all,
	cancel,
	delay,
	fork,
	join,
	race,
	spawn,
	take,
} from 'typed-redux-saga'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'
import {getLocalGameState} from '../utils/state-gen'
import {
	getGameOutcome,
	getGamePlayerOutcome,
	getWinner,
} from '../utils/win-conditions'
import gameSaga, {getTimerForSeconds} from './game'

function setupGame(
	player1: PlayerModel,
	player2: PlayerModel,
	code?: string,
): GameModel {
	let game = new GameModel(
		{
			model: player1,
			deck: player1.deck.cards.map((card) => card.props.numericId),
		},
		{
			model: player2,
			deck: player2.deck.cards.map((card) => card.props.numericId),
		},
		gameSettingsFromEnv(),
		{code},
	)

	let playerEntities = game.components.filterEntities(PlayerComponent)

	// Note player one must be added before player two to make sure each player has the right deck.
	game.components.new(ViewerComponent, {
		player: player1,
		spectator: false,
		playerOnLeft: playerEntities[0],
	})

	game.components.new(ViewerComponent, {
		player: player2,
		spectator: false,
		playerOnLeft: playerEntities[1],
	})

	return game
}

function* gameManager(game: GameModel) {
	// @TODO this one method needs cleanup still
	try {
		const viewers = game.viewers
		const playerIds = viewers.map((viewer) => viewer.player.id)

		const gameType = game.code ? 'Private' : 'Public'
		console.info(
			`${game.logHeader}`,
			`${gameType} game started.`,
			`Players: ${viewers[0].player.name} + ${viewers[1].player.name}.`,
			'Total games:',
			root.getGameIds().length,
		)

		game.broadcastToViewers({type: serverMessages.GAME_START})
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
				(action: any) =>
					action.type === localMessages.PLAYER_REMOVED &&
					playerIds.includes(
						(action as LocalMessageTable[typeof localMessages.PLAYER_REMOVED])
							.player.id,
					),
			),
			forfeit: take(
				(action: any) =>
					action.type === clientMessages.FORFEIT &&
					playerIds.includes(
						(action as RecievedClientMessage<typeof clientMessages.FORFEIT>)
							.playerId,
					),
			),
		})

		for (const viewer of viewers) {
			const gameState = getLocalGameState(game, viewer)
			if (gameState) {
				gameState.timer.turnRemaining = 0
				gameState.timer.turnStartTime = getTimerForSeconds(game, 0)
				if (!game.endInfo.reason) {
					// Remove coin flips from state if game was terminated before game end to prevent
					// clients replaying animations after a forfeit, disconnect, or excessive game duration
					game.components
						.filter(PlayerComponent)
						.forEach((player) => (player.coinFlips = []))
				}
			}
			const outcome = getGamePlayerOutcome(game, result, viewer.player.id)
			// assert(game.endInfo.reason, 'Games can not end without a reason')
			broadcast([viewer.player], {
				type: serverMessages.GAME_END,
				gameState,
				outcome,
				reason: game.endInfo.reason || undefined,
			})
		}
		game.endInfo.outcome = getGameOutcome(game, result)
		game.endInfo.winner = getWinner(game, result)
	} catch (err) {
		console.log('Error: ', err)
		game.endInfo.outcome = 'error'
		broadcast(game.getPlayers(), {type: serverMessages.GAME_CRASH})
	} finally {
		if (game.task) yield* cancel(game.task)
		game.afterGameEnd.call()

		const gameType = game.code ? 'Private' : 'Public'
		console.log(
			`${gameType} game ended. Total games:`,
			root.getGameIds().length - 1,
		)

		delete root.games[game.id]
		root.hooks.gameRemoved.call(game)
	}
}

export function inGame(playerId: PlayerId) {
	return root
		.getGames()
		.some(
			(game) => !!game.viewers.find((viewer) => viewer.player.id === playerId),
		)
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
				const newGame = setupGame(player1, player2)
				root.addGame(newGame)
				yield* fork(gameManager, newGame)
			} else {
				// Something went wrong, remove the undefined player from the queue
				if (player1 === undefined) playersToRemove.push(player1Id)
				if (player2 === undefined) playersToRemove.push(player2Id)
			}
		}

		root.queue = root.queue.filter(
			(player) => !playersToRemove.includes(player),
		)
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
						broadcast([player], {type: serverMessages.PRIVATE_GAME_TIMEOUT})
					}
				}
				delete root.privateQueue[code]
			}
		}
	}
}

export function* joinQueue(
	msg: RecievedClientMessage<typeof clientMessages.JOIN_QUEUE>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	if (!player) {
		console.log('[Join queue] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log('[Join queue] Player is already in game or queue:', player.name)
		broadcast([player], {type: serverMessages.JOIN_QUEUE_FAILURE})
		return
	}

	// Add them to the queue
	root.queue.push(playerId)
	broadcast([player], {type: serverMessages.JOIN_QUEUE_SUCCESS})
	console.log(`Joining queue: ${player.name}`)
}

export function* leaveQueue(
	msg: RecievedClientMessage<typeof clientMessages.LEAVE_QUEUE>,
) {
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
		broadcast([player], {type: serverMessages.LEAVE_QUEUE_SUCCESS})
		console.log(`Left queue: ${player.name}`)
	} else {
		broadcast([player], {type: serverMessages.LEAVE_QUEUE_FAILURE})
		console.log(
			'[Leave queue]: Player tried to leave queue when not there:',
			player.name,
		)
	}
}

export function* createPrivateGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_PRIVATE_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]
	if (!player) {
		console.log('[Create private game] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log(
			'[Create private game] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.CREATE_PRIVATE_GAME_FAILURE})
		return
	}

	// Add to private queue with code
	const gameCode = Math.floor(Math.random() * 10000000).toString(16)
	root.privateQueue[gameCode] = {
		createdTime: Date.now(),
		playerId,
	}

	// Send code to player
	broadcast([player], {
		type: serverMessages.CREATE_PRIVATE_GAME_SUCCESS,
		code: gameCode,
	})

	console.log(`Private game created by ${player.name}.`, `Code: ${gameCode}`)
}

export function* joinPrivateGame(
	msg: RecievedClientMessage<typeof clientMessages.JOIN_PRIVATE_GAME>,
) {
	const {
		playerId,
		payload: {code},
	} = msg
	const player = root.players[playerId]
	if (!player) {
		console.log('[Join private game] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log(
			'[Join private game] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_FAILURE})
		return
	}

	// Find the code in the private queue
	const info = root.privateQueue[code]
	if (!info) {
		broadcast([player], {type: serverMessages.INVALID_CODE})
		return
	}

	// If there is another player, start game, otherwise, add us to queue
	if (info.playerId) {
		// Create new game for these 2 players
		const existingPlayer = root.players[info.playerId]
		if (!existingPlayer) {
			console.log(
				'[Join private game]: Player waiting in queue no longer exists! Code: ' +
					code,
			)
			delete root.privateQueue[code]

			broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_FAILURE})
			return
		}

		const newGame = setupGame(player, existingPlayer, code)
		root.addGame(newGame)

		// Remove this game from the queue, it's started
		delete root.privateQueue[code]

		console.log(`Joining private game: ${player.name}.`, `Code: ${code}`)

		broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_SUCCESS})
		yield* fork(gameManager, newGame)
	} else {
		// Assign this player to the game
		root.privateQueue[code].playerId = playerId
		broadcast([player], {type: serverMessages.WAITING_FOR_PLAYER})

		console.log(`Joining empty private game: ${player.name}.`, `Code: ${code}`)
	}
}

export function* cancelPrivateGame(
	msg: RecievedClientMessage<typeof clientMessages.CANCEL_PRIVATE_GAME>,
) {
	const {playerId} = msg

	for (let code in root.privateQueue) {
		const info = root.privateQueue[code]
		if (info.playerId && info.playerId === playerId) {
			const player = root.players[info.playerId]
			if (player) {
				broadcast([player], {type: serverMessages.PRIVATE_GAME_CANCELLED})
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

	yield* all([fork(randomMatchmakingSaga), fork(cleanUpSaga)])
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
