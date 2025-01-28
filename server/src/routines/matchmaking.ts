import assert from 'assert'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import {
	BoardSlotComponent,
	PlayerComponent,
	RowComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
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
import {addGame, getDeck} from 'db/db-reciever'
import {GameController} from 'game-controller'
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
import {safeCall} from 'utils'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'
import {getLocalGameState} from '../utils/state-gen'
import gameSaga, {getTimerForSeconds} from './game'
import ExBossAI from './virtual/exboss-ai'

function setupGame(
	player1: PlayerModel,
	player2: PlayerModel,
	player1Deck: Deck,
	player2Deck: Deck,
	gameCode?: string,
	spectatorCode?: string,
	apiSecret?: string,
): GameController {
	let con = new GameController(
		{
			model: player1,
			deck: player1Deck.cards.map((card) => card.props.numericId),
		},
		{
			model: player2,
			deck: player2Deck.cards.map((card) => card.props.numericId),
		},
		{gameCode, spectatorCode, apiSecret},
	)

	let playerEntities = con.game.components.filterEntities(PlayerComponent)

	// Note player one must be added before player two to make sure each player has the right deck.
	con.addViewer({
		player: player1,
		playerOnLeft: playerEntities[0],
		spectator: false,
	})

	con.addViewer({
		player: player2,
		playerOnLeft: playerEntities[1],
		spectator: false,
	})

	return con
}

function* gameManager(con: GameController) {
	// @TODO this one method needs cleanup still
	try {
		const viewers = con.viewers
		const playerIds = viewers.map((viewer) => viewer.player.id)

		const gameType =
			playerIds.length === 2 ? (con.gameCode ? 'Private' : 'Public') : 'PvE'

		console.info(
			`${con.game.logHeader}`,
			`${gameType} game started.`,
			`Players: ${viewers.map((viewer) => viewer.player.name).join(' + ')}.`,
			'Total games:',
			root.getGameIds().length,
		)

		con.broadcastToViewers({type: serverMessages.GAME_START})
		root.hooks.newGame.call(con)
		con.task = yield* spawn(gameSaga, con)

		// Kill game on timeout or when user leaves for long time + cleanup after game
		const result = yield* race({
			// game ended (or crashed -> catch)
			gameEnd: join(con.task),
			// kill a game after one hour
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
		})

		if (result.timeout) {
			con.game.outcome = {type: 'timeout'}
		}

		if (result.playerRemoved) {
			let playerThatLeft = con.viewers.find(
				(v) => v.player.id === result.playerRemoved?.player.id,
			)?.playerOnLeft.entity
			let remainingPlayer = con.game.components.find(
				PlayerComponent,
				(_g, c) => c.entity !== playerThatLeft,
			)?.entity
			assert(remainingPlayer, 'There is no way there is no remaining player.')
			con.game.outcome = {
				type: 'player-won',
				victoryReason: 'forfeit',
				winner: remainingPlayer,
			}
		}

		for (const viewer of con.viewers) {
			const gameState = getLocalGameState(con.game, viewer)
			if (gameState) {
				gameState.timer.turnRemaining = 0
				gameState.timer.turnStartTime = getTimerForSeconds(con.game, 0)
				if (!con.game.endInfo.victoryReason) {
					// Remove coin flips from state if game was terminated before game end to prevent
					// clients replaying animations after a forfeit, disconnect, or excessive game duration
					con.game.components
						.filter(PlayerComponent)
						.forEach(
							(player) => (gameState.players[player.entity].coinFlips = []),
						)
				}
			}
		}
	} catch (err) {
		console.log('Error: ', err)
		con.game.outcome = {type: 'game-crash', error: `${(err as Error).stack}`}
	} finally {
		const outcome = con.game.outcome

		assert(outcome, 'All games should have an outcome after they end')

		for (const viewer of con.viewers) {
			const gameState = getLocalGameState(con.game, viewer)
			if (gameState) {
				gameState.timer.turnRemaining = 0
				gameState.timer.turnStartTime = getTimerForSeconds(con.game, 0)
				if (!con.game.endInfo.victoryReason) {
					// Remove coin flips from state if game was terminated before game end to prevent
					// clients replaying animations after a forfeit, disconnect, or excessive game duration
					con.game.components
						.filter(PlayerComponent)
						.forEach(
							(player) => (gameState.players[player.entity].coinFlips = []),
						)
				}
			}
			broadcast([viewer.player], {
				type: serverMessages.GAME_END,
				gameState,
				outcome,
			})
		}

		if (con.task) yield* cancel(con.task)
		con.game.hooks.afterGameEnd.call()

		const gameType = con.gameCode ? 'Private' : 'Public'
		console.log(
			`${gameType} game ended. Total games:`,
			root.getGameIds().length - 1,
		)

		const gamePlayers = con.getPlayers()

		const winnerEntity = outcome.type === 'player-won' ? outcome.winner : null

		const winnerPlayerId = con.viewers.find(
			(viewer) =>
				!viewer.spectator && viewer.playerOnLeftEntity === winnerEntity,
		)?.player.id

		delete root.games[con.id]
		root.hooks.gameRemoved.call(con)

		if (!winnerPlayerId && outcome.type === 'player-won') {
			console.error(
				`[Public Game] There was a winner, but no winner was found with ID ${winnerPlayerId}`,
			)
			return
		}

		const winner = winnerPlayerId ? root.players[winnerPlayerId] : null

		if (
			gamePlayers.length >= 2 &&
			gamePlayers[0].uuid &&
			gamePlayers[1].uuid &&
			// Since you win and lose, this shouldn't count as a game, the count gets very messed up
			gamePlayers[0].uuid !== gamePlayers[1].uuid
		) {
			yield* addGame(
				gamePlayers[0],
				gamePlayers[1],
				outcome,
				Date.now() - con.createdTime,
				winner ? winner.uuid : null,
				con.game.rngSeed,
				con.game.state.turn.turnNumber,
				Buffer.from([0x00]),
				con.gameCode,
			)
		}
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
				yield* safeCall(fork, gameManager, newGame)
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

function* updateDeckSaga(
	player: PlayerModel,
	payload:
		| {
				databaseConnected: true
				activeDeckCode: string
		  }
		| {
				databaseConnected: false
				activeDeck: Deck
		  },
) {
	if (payload.databaseConnected) {
		const newDeck = yield* getDeck(payload.activeDeckCode)
		if (!newDeck) return
		player.setPlayerDeck(newDeck)
		return
	}

	player.setPlayerDeck(payload.activeDeck)
}

export function* joinQueue(
	msg: RecievedClientMessage<typeof clientMessages.JOIN_QUEUE>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	updateDeckSaga(player, msg.payload)

	console.log(player.deck)

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
): GameController {
	const con = new GameController(
		{
			model: player,
			deck: playerDeck.cards.map((card) => card.props.numericId),
		},
		{
			model: opponent,
			deck: opponent.deck,
		},
		{randomizeOrder: false},
	)

	const playerEntities = con.game.components.filterEntities(PlayerComponent)
	con.addViewer({
		player,
		playerOnLeft: playerEntities[0],
		spectator: false,
	})

	con.game.components.new(AIComponent, playerEntities[1], opponent.virtualAI)

	return con
}

export function* createBossGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_BOSS_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	updateDeckSaga(player, msg.payload)

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

	const newBossGameController = setupSolitareGame(player, player.deck, {
		name: 'Evil Xisuma',
		minecraftName: 'EvilXisuma',
		censoredName: 'Evil Xisuma',
		deck: [EvilXisumaBoss],
		virtualAI: ExBossAI,
		disableDeckingOut: true,
		selectedCoinHead: 'evilx',
	})
	newBossGameController.game.state.isBossGame = true

	function destroyRow(row: RowComponent) {
		newBossGameController.game.components
			.filterEntities(BoardSlotComponent, query.slot.rowIs(row.entity))
			.forEach((slotEntity) =>
				newBossGameController.game.components.delete(slotEntity),
			)
		newBossGameController.game.components.delete(row.entity)
	}

	// Remove challenger's rows other than indexes 0, 1, and 2
	newBossGameController.game.components
		.filter(
			RowComponent,
			query.row.opponentPlayer,
			(_game, row) => row.index > 2,
		)
		.forEach(destroyRow)
	// Remove boss' rows other than index 0
	newBossGameController.game.components
		.filter(
			RowComponent,
			query.row.currentPlayer,
			query.not(query.row.index(0)),
		)
		.forEach(destroyRow)
	// Remove boss' item slots
	newBossGameController.game.components
		.filterEntities(
			BoardSlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
		)
		.forEach((slotEntity) =>
			newBossGameController.game.components.delete(slotEntity),
		)

	newBossGameController.game.settings.disableRewardCards = true

	root.addGame(newBossGameController)

	yield* safeCall(fork, gameManager, newBossGameController)
}

export function* createPrivateGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_PRIVATE_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	updateDeckSaga(player, msg.payload)

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

	updateDeckSaga(player, msg.payload)

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
		const viewer = spectatorGame.addViewer({
			player: player,
			playerOnLeft: spectatorGame.game.state.order[0],
			spectator: true,
		})

		console.log(
			`Spectator ${player.name} Joined private game. Code: ${spectatorGame.gameCode}`,
		)

		spectatorGame.chat.push({
			sender: {
				type: 'viewer',
				id: player.id,
			},
			message: formatText(`$s${player.name}$ $ystarted spectating$`),
			createdAt: Date.now(),
		})

		spectatorGame.chatUpdate()

		broadcast([player], {
			type: serverMessages.SPECTATE_PRIVATE_GAME_START,
			localGameState: getLocalGameState(spectatorGame.game, viewer),
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
				message: formatText(`$s${player.name}$ $ystarted spectating$`),
				createdAt: Date.now(),
			})
		}

		for (const playerId of root.privateQueue[code].spectatorsWaiting) {
			const viewer = newGame.addViewer({
				player: root.players[playerId],
				spectator: true,
				playerOnLeft: newGame.game.state.order[0],
			})
			let gameState = getLocalGameState(newGame.game, viewer)

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

		yield* safeCall(fork, gameManager, newGame)
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

export default matchmakingSaga
