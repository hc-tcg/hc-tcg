import assert from 'assert'
import {CARDS} from 'common/cards'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import {
	AchievementComponent,
	BoardSlotComponent,
	PlayerComponent,
	RowComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import serverConfig from 'common/config/server-config'
import {COINS} from 'common/cosmetics/coins'
import {defaultAppearance} from 'common/cosmetics/default'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {AchievementProgress, EarnedAchievement} from 'common/types/achievements'
import {Deck} from 'common/types/deck'
import {GameOutcome} from 'common/types/game-state'
import {formatText} from 'common/utils/formatting'
import {OpponentDefs} from 'common/utils/state-gen'
import {validateDeck} from 'common/utils/validation'
import {
	addGame,
	getAchievementProgress,
	getDeck,
	getGameReplay,
	sendAfterGameInfo,
	updateAchievements,
} from 'db/db-reciever'
import {GameController} from 'game-controller'
import {LocalMessageTable, localMessages} from 'messages'
import {
	all,
	cancel,
	delay,
	fork,
	join,
	put,
	race,
	spawn,
	take,
} from 'typed-redux-saga'
import {safeCall} from 'utils'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'
import {getLocalGameState} from '../utils/state-gen'
import gameSaga, {getTimerForSeconds} from './game'
import {TurnActionCompressor} from './turn-action-compressor'
import ExBossAI from './virtual/exboss-ai'

function setupGame(
	player1: PlayerModel,
	player2: PlayerModel,
	player1Deck: Deck,
	player2Deck: Deck,
	player1Score: number,
	player2Score: number,
	gameCode?: string,
	spectatorCode?: string,
	apiSecret?: string,
): GameController {
	let con = new GameController(
		{
			model: player1,
			deck: player1Deck.cards.map((card) => card.id).sort((a, b) => a - b),
			score: player1Score,
		},
		{
			model: player2,
			deck: player2Deck.cards.map((card) => card.id).sort((a, b) => a - b),
			score: player2Score,
		},
		{gameCode, spectatorCode, apiSecret, countAchievements: 'all'},
	)

	let playerEntities = con.game.components.filterEntities(PlayerComponent)

	// Note player one must be added before player two to make sure each player has the right deck.
	con.addViewer({
		player: player1,
		playerOnLeft: playerEntities[0],
		spectator: false,
		replayer: false,
	})

	con.addViewer({
		player: player2,
		playerOnLeft: playerEntities[1],
		spectator: false,
		replayer: false,
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

		con.broadcastToViewers({
			type: serverMessages.GAME_START,
			spectatorCode: con.spectatorCode ?? undefined,
		})
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
				victoryReason: 'disconnect',
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
		console.info('Error: ', err)
		con.game.outcome = {type: 'game-crash', error: `${(err as Error).stack}`}
	} finally {
		const outcome = con.game.outcome

		if (!outcome) return

		const gameEndTime = new Date()
		if (con.task) yield* cancel(con.task)
		con.game.hooks.afterGameEnd.call()

		const newAchievements: Record<string, Array<EarnedAchievement>> = {}
		for (let k = 0; k < con.viewers.length; k++) {
			if (!root.db.connected) continue
			const v = con.viewers[k]
			if (v.spectator) continue
			const playerEntity = v.playerOnLeftEntity
			newAchievements[playerEntity] = []
			const thisGameAchievements: AchievementProgress = {}

			let player = con.game.components.get(playerEntity)
			assert(
				player,
				"There should definitely be a player on the left if there is an entity, if there isn't, something went really wrong",
			)

			const achievements = con.game.components.filter(
				AchievementComponent,
				(_game, achievement) => achievement.player === playerEntity,
			)

			achievements.forEach((achievement) => {
				achievement.props.onGameEnd(con.game, player, achievement, outcome)
				thisGameAchievements[achievement.props.numericId] = {
					goals: achievement.goals,
					levels: [],
				}
			})

			const achievementInfo = yield* updateAchievements(
				v.player.uuid,
				thisGameAchievements,
				gameEndTime,
			)
			newAchievements[playerEntity] = achievementInfo.newAchievements
			v.player.updateAchievementProgress(achievementInfo.newProgress)
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
			broadcast([viewer.player], {
				type: serverMessages.GAME_END,
				gameState,
				outcome,
				earnedAchievements: !viewer.spectator
					? newAchievements[viewer.playerOnLeftEntity]
					: [],
				gameEndTime: Date.now(),
			})
		}

		const gameType = con.gameCode ? 'Private' : 'Public'
		console.info(
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
		const turnActionCompressor = new TurnActionCompressor()
		const turnActionsBuffer = con.game.state.isEvilXBossGame
			? null
			: yield* turnActionCompressor.turnActionsToBuffer(con)

		if (
			root.db.connected &&
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
				gameEndTime.getTime() - con.createdTime,
				winner ? winner.uuid : null,
				con.game.rngSeed,
				con.game.state.turn.turnNumber,
				turnActionsBuffer,
				con.gameCode,
			)
		}
		if (root.db.connected) yield* sendAfterGameInfo(gamePlayers)

		const getGameScore = (
			outcome: GameOutcome | undefined,
			player: PlayerId,
		) => {
			assert(outcome, "A game can't end without an outcome.")
			if (outcome.type === 'tie') return 0.5
			if (outcome.type === 'player-won' && winnerPlayerId === player) return 1
			return 0
		}

		if (
			con.game.state.isEvilXBossGame ||
			!gamePlayers[0].id ||
			!gamePlayers[1].id
		) {
			return
		}

		const player1Score =
			getGameScore(con.game.outcome, gamePlayers[0].id) + con.player1Defs.score
		const player2Score =
			getGameScore(con.game.outcome, gamePlayers[1].id) + con.player2Defs.score

		broadcast([gamePlayers[0]], {
			type: serverMessages.SEND_REMATCH,
			rematch: {
				opponentId: gamePlayers[1].id,
				time: gameEndTime.getTime(),
				spectatorCode: con.spectatorCode,
				playerScore: player1Score,
				opponentScore: player2Score,
			},
		})
		broadcast([gamePlayers[1]], {
			type: serverMessages.SEND_REMATCH,
			rematch: {
				opponentId: gamePlayers[0].id,
				time: gameEndTime.getTime(),
				spectatorCode: con.spectatorCode,
				playerScore: player2Score,
				opponentScore: player1Score,
			},
		})
		yield* delay(serverConfig.limits.rematchTime)
		broadcast(gamePlayers, {
			type: serverMessages.SEND_REMATCH,
			rematch: null,
		})
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

				if (player1 && root.awaitingRematch[player1Id]) {
					const opponent =
						root.players[root.awaitingRematch[player1Id].opponentId]
					broadcast([player1, opponent], {
						type: serverMessages.REMATCH_DENIED,
					})
				}
				if (player2 && root.awaitingRematch[player2Id]) {
					const opponent =
						root.players[root.awaitingRematch[player2Id].opponentId]
					broadcast([player2, opponent], {
						type: serverMessages.REMATCH_DENIED,
					})
				}

				const newGame = setupGame(
					player1,
					player2,
					player1.deck,
					player2.deck,
					0,
					0,
				)
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

function* setupPlayerInfo(
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
		player.setPlayerDeck(newDeck)
		const latestAchievementProgress = yield* getAchievementProgress(player.uuid)
		player.updateAchievementProgress(latestAchievementProgress)
		return
	}

	player.setPlayerDeck(payload.activeDeck)
}

////////////////////////
// CLIENT CONNECTION
////////////////////////

export function* joinPublicQueue(
	msg: RecievedClientMessage<typeof clientMessages.JOIN_PUBLIC_QUEUE>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	yield* setupPlayerInfo(player, msg.payload)

	if (!player) {
		console.info('[Join queue] Player not found: ', playerId)
		return
	}

	if (
		!player.deck ||
		!validateDeck(player.deck.cards.map((card) => CARDS[card.id])).valid
	) {
		console.info(
			'[Join queue] Player tried to join queue with an invalid deck:',
			player.name,
		)
		broadcast([player], {type: serverMessages.JOIN_PUBLIC_QUEUE_FAILURE})
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.info(
			'[Join queue] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.JOIN_PUBLIC_QUEUE_FAILURE})
		return
	}

	// Add them to the queue
	root.queue.push(playerId)
	broadcast([player], {type: serverMessages.JOIN_PUBLIC_QUEUE_SUCCESS})
	console.info(`Joining queue: ${player.name}`)
}

export function* leavePublicQueue(
	msg: RecievedClientMessage<typeof clientMessages.LEAVE_PUBLIC_QUEUE>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	if (!player) {
		console.info('[Leave queue] Player not found: ', playerId)
		return
	}

	// Remove them from the queue
	const queueIndex = root.queue.indexOf(playerId)
	if (queueIndex >= 0) {
		root.queue.splice(queueIndex, 1)
		broadcast([player], {type: serverMessages.LEAVE_QUEUE_SUCCESS})
		console.info(`Left queue: ${player.name}`)
	} else {
		broadcast([player], {type: serverMessages.LEAVE_QUEUE_FAILURE})
		console.info(
			'[Leave queue]: Player tried to leave queue when not there:',
			player.name,
		)
	}
}

export function* joinPrivateGame(
	msg: RecievedClientMessage<typeof clientMessages.JOIN_PRIVATE_QUEUE>,
) {
	const {
		playerId,
		payload: {code},
	} = msg
	const player = root.players[playerId]

	yield* setupPlayerInfo(player, msg.payload)

	if (!player) {
		console.info('[Join private game] Player not found: ', playerId)
		return
	}

	if (
		!player.deck ||
		!validateDeck(player.deck.cards.map((card) => CARDS[card.id])).valid
	) {
		console.info(
			'[Join private game] Player tried to join private game with an invalid deck: ',
			playerId,
		)
		broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_FAILURE})
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.info(
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
		// If we want to join our own game, that is an error
		if (info.playerId === player.id) {
			broadcast([player], {type: serverMessages.INVALID_CODE})
			return
		}

		// Create new game for these 2 players
		const existingPlayer = root.players[info.playerId]
		if (!existingPlayer) {
			console.info(
				'[Join private game]: Player waiting in queue no longer exists! Code: ' +
					code,
			)
			delete root.privateQueue[code]

			broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_FAILURE})
			return
		}

		if (!existingPlayer.deck) {
			console.info(
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
			0,
			0,
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
				replayer: false,
			})
			let gameState = getLocalGameState(newGame.game, viewer)

			broadcast([root.players[playerId]], {
				type: serverMessages.SPECTATE_PRIVATE_GAME_START,
				localGameState: gameState,
			})
		}

		console.info(`Joining private game: ${player.name}.`, `Code: ${code}`)

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
		broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_SUCCESS})

		console.info(`Joining empty private game: ${player.name}.`, `Code: ${code}`)
	}
}

export function* spectatePrivateGame(
	msg: RecievedClientMessage<typeof clientMessages.SPECTATE_PRIVATE_GAME>,
) {
	const {
		playerId,
		payload: {code},
	} = msg
	const player = root.players[playerId]

	if (!player) {
		console.info('[Spectate private game] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.info(
			'[Spectate private game] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.SPECTATE_PRIVATE_GAME_FAILURE})
		return
	}

	// Check if our code matches an already running game
	const spectatorGame = Object.values(root.games).find(
		(game) => game.spectatorCode === code,
	)

	if (spectatorGame) {
		const viewer = spectatorGame.addViewer({
			player: player,
			playerOnLeft: spectatorGame.game.state.order[0],
			spectator: true,
			replayer: false,
		})

		console.info(
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

	// No existing game yet, check for a game that hasn't started
	const gameQueue = [
		...Object.values(root.privateQueue),
		...Object.values(root.awaitingRematch),
	].find((q) => q.spectatorCode === code)

	if (!gameQueue) {
		broadcast([player], {type: serverMessages.INVALID_CODE})
		return
	}

	// Players can not spectate games they started.
	if (gameQueue.playerId === player.id) {
		broadcast([player], {type: serverMessages.INVALID_CODE})
		return
	}

	gameQueue.spectatorsWaiting.push(player.id)
	broadcast([player], {
		type: serverMessages.SPECTATE_PRIVATE_GAME_WAITING,
	})
}

export function* createPrivateGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_PRIVATE_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	yield* setupPlayerInfo(player, msg.payload)

	if (!player) {
		console.info('[Create private game] Player not found: ', playerId)
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.info(
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

	console.info(
		`Private game created by ${player.name}.`,
		`Code: ${gameCode}`,
		`Spectator Code: ${spectatorCode}`,
	)
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
			console.info(`Private game cancelled. Code: ${code}`)
		}
	}
}

// Functions for both private and private spectate
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

export function* leaveRematchGame(
	msg: RecievedClientMessage<typeof clientMessages.LEAVE_REMATCH_GAME>,
) {
	const player = root.players[msg.playerId]
	console.info(`[Rematch] ${player.name} left the rematch game they started.`)
	const {playerId} = msg
	delete root.awaitingRematch[playerId]
}

export function* cancelRematch(
	msg: RecievedClientMessage<typeof clientMessages.CANCEL_REMATCH>,
) {
	const player = root.players[msg.playerId]
	const opponentPlayer = root.players[msg.payload.rematch.opponentId]
	delete root.awaitingRematch[opponentPlayer.id]
	delete root.awaitingRematch[player.id]
	broadcast([player, opponentPlayer], {type: serverMessages.REMATCH_DENIED})
}

export function* createBossGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_BOSS_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	yield* setupPlayerInfo(player, msg.payload)

	if (!player) {
		console.info('[Create Boss game] Player not found: ', playerId)
		return
	}

	if (
		!player.deck ||
		!validateDeck(player.deck.cards.map((card) => CARDS[card.id])).valid
	) {
		console.info(
			'[Join private game] Player tried to join private game with an invalid deck: ',
			playerId,
		)
		broadcast([player], {type: serverMessages.CREATE_BOSS_GAME_FAILURE})
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.info(
			'[Create Boss game] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.CREATE_BOSS_GAME_FAILURE})
		return
	}

	broadcast([player], {type: serverMessages.CREATE_BOSS_GAME_SUCCESS})

	const newBossGameController = setupSolitareGame(player, player.deck, {
		uuid: '',
		name: 'Evil Xisuma',
		minecraftName: 'EvilXisuma',
		censoredName: 'Evil Xisuma',
		deck: [EvilXisumaBoss],
		virtualAI: ExBossAI,
		disableDeckingOut: true,
		appearance: {...defaultAppearance, coin: COINS['evilx']},
	})
	newBossGameController.game.state.isEvilXBossGame = true

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
		.filter(RowComponent, query.row.currentPlayer)
		.forEach((row) => {
			row.itemsSlotEntities?.forEach((slotEntity) =>
				newBossGameController.game.components.delete(slotEntity),
			)
			row.itemsSlotEntities = []
		})

	newBossGameController.game.settings.disableRewardCards = true

	root.addGame(newBossGameController)

	yield* safeCall(fork, gameManager, newBossGameController)
}

export function* createRematchGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_REMATCH_GAME>,
) {
	const playerId = msg.playerId
	const {opponentId, spectatorCode, playerScore, opponentScore} = msg.payload
	const player = root.players[playerId]
	const opponent = root.players[opponentId]

	yield* setupPlayerInfo(player, msg.payload)

	if (!player) {
		console.info('[Join rematch game] Player not found: ', playerId)
		return
	}

	if (
		!player.deck ||
		!validateDeck(player.deck.cards.map((card) => CARDS[card.id])).valid
	) {
		console.info(
			'[Join rematch game] Player tried to join private game with an invalid deck: ',
			playerId,
		)
		broadcast([player], {type: serverMessages.CREATE_REMATCH_FAILURE})
		return
	}

	if (inGame(playerId) || inQueue(playerId)) {
		console.info(
			'[Join private game] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.CREATE_REMATCH_FAILURE})
		return
	}

	// Find the code in the rematch queue
	const waitingInfo = root.awaitingRematch[opponentId]
	if (!waitingInfo) {
		// Assign this player to the game
		root.awaitingRematch[playerId] = {
			playerId: playerId,
			opponentId: opponentId,
			playerScore: playerScore,
			opponentScore: opponentScore,
			spectatorCode: spectatorCode || undefined,
			spectatorsWaiting: [],
		}
		broadcast([player], {type: serverMessages.CREATE_REMATCH_SUCCESS})
		console.info(
			`[Rematch] ${player.name} requested a rematch from their last opponent`,
		)
		broadcast([opponent], {
			type: serverMessages.REMATCH_REQUESTED,
			opponentName: opponent.name,
		})
		return
	}

	// Remove rematch player from waiting queue
	delete root.awaitingRematch[opponentId]

	// If we want to join our own game, that is an error
	if (waitingInfo.playerId === player.id) {
		console.info('[Rematch]: Player attempted to join their own rematch!')
		broadcast([player], {type: serverMessages.CREATE_REMATCH_FAILURE})
		return
	}

	// Create new game for these 2 players
	const existingPlayer = root.players[opponentId]
	if (!existingPlayer) {
		console.info('[Rematch]: Player waiting in queue no longer exists!')
		broadcast([player], {type: serverMessages.CREATE_REMATCH_FAILURE})
		return
	}

	if (!existingPlayer.deck) {
		console.info('[Rematch]: Player waiting in queue has no deck!')
		broadcast([player], {type: serverMessages.CREATE_REMATCH_FAILURE})
		return
	}

	const newGame = setupGame(
		player,
		existingPlayer,
		player.deck,
		existingPlayer.deck,
		waitingInfo.opponentScore,
		waitingInfo.playerScore,
		undefined,
		spectatorCode ?? undefined,
	)
	root.addGame(newGame)

	console.info(`[Rematch] Joining rematch game: ${player.name}.`)

	broadcast([player], {type: serverMessages.CREATE_REMATCH_SUCCESS})

	for (const playerId of waitingInfo.spectatorsWaiting) {
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

	for (const playerId of waitingInfo.spectatorsWaiting) {
		const viewer = newGame.addViewer({
			player: root.players[playerId],
			spectator: true,
			playerOnLeft: newGame.game.state.order[0],
			replayer: false,
		})
		let gameState = getLocalGameState(newGame.game, viewer)

		broadcast([root.players[playerId]], {
			type: serverMessages.SPECTATE_PRIVATE_GAME_START,
			localGameState: gameState,
		})
	}

	yield* safeCall(fork, gameManager, newGame)
}

//@Todo fix games from just timing out when player leaves
export function* createReplayGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_REPLAY_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]

	if (inGame(playerId) || inQueue(playerId)) {
		console.info(
			'[Create private game] Player is already in game or queue:',
			player.name,
		)
		broadcast([player], {type: serverMessages.CREATE_PRIVATE_GAME_FAILURE})
		return
	}
	const replay = yield* getGameReplay(msg.payload.id)
	if (!replay) {
		broadcast([root.players[playerId]], {
			type: serverMessages.INVALID_REPLAY,
		})
		return
	}

	const con = new GameController(replay.player1Defs, replay.player2Defs, {
		randomSeed: replay.seed,
		randomizeOrder: true,
		gameId: msg.payload.id.toString(),
	})
	root.addGame(con)
	root.hooks.newGame.call(con)

	const viewerEntity = con.game.components.findEntity(
		PlayerComponent,
		query.player.uuid(msg.payload.uuid),
	)

	const viewer = con.addViewer({
		player: root.players[playerId],
		spectator: true,
		playerOnLeft: viewerEntity ? viewerEntity : con.game.state.order[0],
		replayer: true,
	})
	let gameState = getLocalGameState(con.game, viewer)

	broadcast([root.players[playerId]], {
		type: serverMessages.SPECTATE_PRIVATE_GAME_START,
		localGameState: gameState,
	})

	con.task = yield* spawn(gameSaga, con)

	console.info(
		`${con.game.logHeader}`,
		`Replay game started: ${con.id}`,
		`Viewer: ${msg.playerId}.`,
		'Total games:',
		root.getGameIds().length,
	)

	yield* delay(1000)

	const replayActions = replay.replay

	for (let i = 0; i < replayActions.length; i++) {
		if (con.game.outcome) break

		const action = replayActions[i]

		console.log(action.player)

		yield* delay(action.millisecondsSinceLastAction)
		yield* put({
			type: localMessages.GAME_TURN_ACTION,
			action: action.action,
			playerEntity: action.player,
		})
	}

	gameState.timer.turnRemaining = 0
	gameState.timer.turnStartTime = getTimerForSeconds(con.game, 0)
	if (!con.game.endInfo.victoryReason) {
		// Remove coin flips from state if game was terminated before game end to prevent
		// clients replaying animations after a forfeit, disconnect, or excessive game duration
		con.game.components
			.filter(PlayerComponent)
			.forEach((player) => (gameState.players[player.entity].coinFlips = []))
	}

	yield* delay(10)

	broadcast([viewer.player], {
		type: serverMessages.GAME_END,
		gameState,
		outcome: con.game.outcome
			? con.game.outcome
			: {type: 'game-crash', error: 'The replay game did not save properly.'},
		earnedAchievements: [],
		gameEndTime: Date.now(),
	})

	delete root.games[con.id]
	root.hooks.gameRemoved.call(con)
	console.info(`Replay game ended: ${con.id}`)
}

function onPlayerLeft(player: PlayerModel) {
	// Remove player from all queues

	// Public queue
	if (root.queue.some((id) => id === player.id)) {
		const queueIndex = root.queue.indexOf(player.id)
		if (queueIndex >= 0) {
			root.queue.splice(queueIndex, 1)
			console.info(`Left queue: ${player.name}`)
		}
	}

	// Private queue
	for (let code in root.privateQueue) {
		const info = root.privateQueue[code]
		if (info.playerId && info.playerId === player.id) {
			delete root.privateQueue[code]
			console.info(`Private game cancelled. Code: ${code}`)
		}
		if (info.spectatorsWaiting.includes(player.id)) {
			info.spectatorsWaiting = info.spectatorsWaiting.filter(
				(x) => x !== player.id,
			)
		}
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
			deck: playerDeck.cards.map((card) => CARDS[card.id].numericId),
			score: 0,
		},
		{
			model: opponent,
			deck: opponent.deck,
			score: 0,
		},
		{randomizeOrder: false, countAchievements: 'boss'},
	)

	const playerEntities = con.game.components.filterEntities(PlayerComponent)
	con.addViewer({
		player,
		playerOnLeft: playerEntities[0],
		spectator: false,
		replayer: false,
	})

	con.game.components.new(AIComponent, playerEntities[1], opponent.virtualAI)

	return con
}

function* matchmakingSaga() {
	root.hooks.playerLeft.add('matchmaking', onPlayerLeft)

	yield* all([fork(randomMatchmakingSaga), fork(cleanUpSaga)])
}

export default matchmakingSaga
