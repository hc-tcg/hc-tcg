import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import {
	BoardSlotComponent,
	PlayerComponent,
	RowComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel, gameSettingsFromEnv} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {Deck} from 'common/types/deck'
import {formatText} from 'common/utils/formatting'
import {OpponentDefs} from 'common/utils/state-gen'
import {validateDeck} from 'common/utils/validation'
import {addGame} from 'db/db-reciever'
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
import ExBossAI from './virtual/exboss-ai'

function setupGame(
	player1: PlayerModel,
	player2: PlayerModel,
	player1Deck: Deck,
	player2Deck: Deck,
	code?: string,
	spectatorCode?: string,
	apiSecret?: string,
): GameModel {
	let game = new GameModel(
		{
			model: player1,
			deck: player1Deck.cards.map((card) => card.props.numericId),
		},
		{
			model: player2,
			deck: player2Deck.cards.map((card) => card.props.numericId),
		},
		gameSettingsFromEnv(),
		{gameCode: code, spectatorCode, apiSecret},
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

		const gameType =
			playerIds.length === 2 ? (game.gameCode ? 'Private' : 'Public') : 'PvE'

		console.info(
			`${game.logHeader}`,
			`${gameType} game started.`,
			`Players: ${viewers.map((viewer) => viewer.player.name).join(' + ')}.`,
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
			playerRemoved: take<
				LocalMessageTable[typeof localMessages.PLAYER_REMOVED]
			>(
				(action: any) =>
					action.type === localMessages.PLAYER_REMOVED &&
					playerIds.includes(
						(action as LocalMessageTable[typeof localMessages.PLAYER_REMOVED])
							.player.id,
					),
			),
			forfeit: take<RecievedClientMessage<typeof clientMessages.FORFEIT>>(
				(action: any) =>
					action.type === clientMessages.FORFEIT &&
					playerIds.includes(
						(action as RecievedClientMessage<typeof clientMessages.FORFEIT>)
							.playerId,
					),
			),
		})

		for (const viewer of game.viewers) {
			const gameState = getLocalGameState(game, viewer)
			if (gameState) {
				gameState.timer.turnRemaining = 0
				gameState.timer.turnStartTime = getTimerForSeconds(game, 0)
				if (!game.endInfo.reason) {
					// Remove coin flips from state if game was terminated before game end to prevent
					// clients replaying animations after a forfeit, disconnect, or excessive game duration
					game.components
						.filter(PlayerComponent)
						.forEach(
							(player) => (gameState.players[player.entity].coinFlips = []),
						)
				}
			}
			const outcome = getGamePlayerOutcome(game, result, viewer)
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
		game.hooks.afterGameEnd.call()

		const gameType = game.gameCode ? 'Private' : 'Public'
		console.log(
			`${gameType} game ended. Total games:`,
			root.getGameIds().length - 1,
		)

		const gamePlayers = game.getPlayers()
		const winner = gamePlayers.find(
			(player) => player.id === game.endInfo.winner,
		)

		if (winner === null && game.endInfo.winner) {
			console.error(
				`[Public Game] There was a winner, but no winner was found with ID ${game.endInfo.winner}`,
			)
			return
		}

		if (
			gamePlayers.length >= 2 &&
			gamePlayers[0].uuid &&
			gamePlayers[1].uuid &&
			game.endInfo.outcome &&
			// Since you win and lose, this shouldn't count as a game, the count gets very messed up
			gamePlayers[0].uuid !== gamePlayers[1].uuid
		) {
			yield* addGame(
				gamePlayers[0],
				gamePlayers[1],
				game.endInfo.outcome,
				Date.now() - game.createdTime,
				winner ? winner.uuid : null,
				'', //@TODO Add seed
				Buffer.from([0x00]),
			)
		}

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
	return root.queue.some((id) => id === playerId)
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

			if (player1 && player2 && player1.deck && player2.deck) {
				playersToRemove.push(player1.id, player2.id)
				const newGame = setupGame(player1, player2, player1.deck, player2.deck)
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

	if (
		!player.deck ||
		!validateDeck(player.deck.cards.map((card) => card.props)).valid
	) {
		console.log(
			'[Join queue] Player tried to join queue with an invalid deck:',
			player.name,
		)
		broadcast([player], {type: serverMessages.JOIN_QUEUE_FAILURE})
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

function setupSolitareGame(
	player: PlayerModel,
	playerDeck: Deck,
	opponent: OpponentDefs,
): GameModel {
	const game = new GameModel(
		{
			model: player,
			deck: playerDeck.cards.map((card) => card.props.numericId),
		},
		{
			model: opponent,
			deck: opponent.deck,
		},
		gameSettingsFromEnv(),
		{gameCode: 'solitare', randomizeOrder: false},
	)

	const playerEntities = game.components.filterEntities(PlayerComponent)
	game.components.new(ViewerComponent, {
		player,
		spectator: false,
		playerOnLeft: playerEntities[0],
	})

	game.components.new(AIComponent, playerEntities[1], opponent.virtualAI)

	return game
}

export function* createBossGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_BOSS_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]
	if (!player) {
		console.log('[Create Boss game] Player not found: ', playerId)
		return
	}

	if (
		!player.deck ||
		!validateDeck(player.deck.cards.map((card) => card.props)).valid
	) {
		console.log(
			'[Join private game] Player tried to join private game with an invalid deck: ',
			playerId,
		)
		broadcast([player], {type: serverMessages.CREATE_BOSS_GAME_FAILURE})
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.log(
			'[Create Boss game] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.CREATE_BOSS_GAME_FAILURE})
		return
	}

	broadcast([player], {type: serverMessages.CREATE_BOSS_GAME_SUCCESS})

	const newBossGame = setupSolitareGame(player, player.deck, {
		name: 'Evil Xisuma',
		minecraftName: 'EvilXisuma',
		censoredName: 'Evil Xisuma',
		deck: [EvilXisumaBoss],
		virtualAI: ExBossAI,
		disableDeckingOut: true,
	})
	newBossGame.state.isBossGame = true

	function destroyRow(row: RowComponent) {
		newBossGame.components
			.filterEntities(BoardSlotComponent, query.slot.rowIs(row.entity))
			.forEach((slotEntity) => newBossGame.components.delete(slotEntity))
		newBossGame.components.delete(row.entity)
	}

	// Remove challenger's rows other than indexes 0, 1, and 2
	newBossGame.components
		.filter(
			RowComponent,
			query.row.opponentPlayer,
			(_game, row) => row.index > 2,
		)
		.forEach(destroyRow)
	// Remove boss' rows other than index 0
	newBossGame.components
		.filter(
			RowComponent,
			query.row.currentPlayer,
			query.not(query.row.index(0)),
		)
		.forEach(destroyRow)
	// Remove boss' item slots
	newBossGame.components
		.filterEntities(
			BoardSlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
		)
		.forEach((slotEntity) => newBossGame.components.delete(slotEntity))

	newBossGame.settings.disableRewardCards = true

	root.addGame(newBossGame)

	yield* fork(gameManager, newBossGame)
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
	let {gameCode, spectatorCode} = root.createPrivateGame(playerId)

	// Send code to player
	broadcast([player], {
		type: serverMessages.CREATE_PRIVATE_GAME_SUCCESS,
		gameCode: gameCode,
		spectatorCode: spectatorCode,
	})

	console.log(
		`Private game created by ${player.name}.`,
		`Code: ${gameCode}`,
		`Spectator Code: ${spectatorCode}`,
	)
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

	if (
		!player.deck ||
		!validateDeck(player.deck.cards.map((card) => card.props)).valid
	) {
		console.log(
			'[Join private game] Player tried to join private game with an invalid deck: ',
			playerId,
		)
		broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_FAILURE})
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

	// Check if spectator game is running first
	const spectatorGame = Object.values(root.games).find(
		(game) => game.spectatorCode === code,
	)

	if (spectatorGame) {
		const viewer = spectatorGame.components.new(ViewerComponent, {
			player: player,
			spectator: true,
			playerOnLeft: spectatorGame.state.order[0],
		})

		console.log(
			`Spectator ${player.name} Joined private game. Code: ${spectatorGame.gameCode}`,
		)

		spectatorGame.chat.push({
			sender: {
				type: 'viewer',
				id: player.id,
			},
			message: formatText(`$s${player.name}$ started spectating.`),
			createdAt: Date.now(),
		})

		broadcast(spectatorGame.getPlayers(), {
			type: serverMessages.CHAT_UPDATE,
			messages: spectatorGame.chat,
		})

		broadcast([player], {
			type: serverMessages.SPECTATE_PRIVATE_GAME_START,
			localGameState: getLocalGameState(spectatorGame, viewer),
		})

		return
	}

	let gameQueue = Object.values(root.privateQueue).find(
		(q) => q.spectatorCode === code,
	)
	if (gameQueue) {
		// Players can not spectate games they started.
		if (gameQueue.playerId === player.id) {
			broadcast([player], {type: serverMessages.INVALID_CODE})
			return
		}
		gameQueue.spectatorsWaiting.push(player.id)
		broadcast([player], {
			type: serverMessages.SPECTATE_PRIVATE_GAME_WAITING,
		})
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
		// If we want to join our own game, that is an error
		if (info.playerId === player.id) {
			broadcast([player], {type: serverMessages.INVALID_CODE})
			return
		}

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

		if (!existingPlayer.deck) {
			console.log(
				'[Join private game]: Player waiting in queue has no deck! Code: ' +
					code,
			)
			delete root.privateQueue[code]

			broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_FAILURE})
			return
		}

		const newGame = setupGame(
			player,
			existingPlayer,
			player.deck,
			existingPlayer.deck,
			root.privateQueue[code].gameCode,
			root.privateQueue[code].spectatorCode,
			root.privateQueue[code].apiSecret,
		)
		root.addGame(newGame)

		for (const playerId of root.privateQueue[code].spectatorsWaiting) {
			const player = root.players[playerId]
			newGame.chat.push({
				sender: {
					type: 'viewer',
					id: player.id,
				},
				message: formatText(`$s${player.name}$ started spectating.`),
				createdAt: Date.now(),
			})
		}

		for (const playerId of root.privateQueue[code].spectatorsWaiting) {
			const viewer = newGame.components.new(ViewerComponent, {
				player: root.players[playerId],
				spectator: true,
				playerOnLeft: newGame.state.order[0],
			})
			let gameState = getLocalGameState(newGame, viewer)

			broadcast([root.players[playerId]], {
				type: serverMessages.SPECTATE_PRIVATE_GAME_START,
				localGameState: gameState,
			})
		}

		console.log(`Joining private game: ${player.name}.`, `Code: ${code}`)

		// Remove this game from the queue, it's started
		let tmpQueue = root.privateQueue[code]
		delete root.privateQueue[code]

		broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_SUCCESS})
		if (tmpQueue.playerId) {
			broadcast([root.players[tmpQueue.playerId]], {
				type: serverMessages.JOIN_PRIVATE_GAME_SUCCESS,
			})
		}

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
				broadcast([player], {type: serverMessages.PRIVATE_GAME_TIMEOUT})
			}

			root.hooks.privateCancelled.call(code)
			delete root.privateQueue[code]
			console.log(`Private game cancelled. Code: ${code}`)
		}
	}
}

export function* leavePrivateQueue(
	msg: RecievedClientMessage<typeof clientMessages.LEAVE_PRIVATE_QUEUE>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	for (let code in root.privateQueue) {
		const info = root.privateQueue[code]
		if (info.playerId && info.playerId === playerId) {
			info.playerId = null
		}
		if (info.spectatorsWaiting.includes(player.id)) {
			info.spectatorsWaiting = info.spectatorsWaiting.filter(
				(x) => x !== player.id,
			)
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
		if (info.spectatorsWaiting.includes(player.id)) {
			info.spectatorsWaiting = info.spectatorsWaiting.filter(
				(x) => x !== player.id,
			)
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
