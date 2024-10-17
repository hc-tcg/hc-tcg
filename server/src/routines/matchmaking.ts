import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import {
	BoardSlotComponent,
	PlayerComponent,
	RowComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {GameModel, gameSettingsFromEnv} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import ExBossAI from 'common/routines/virtual/exboss-ai'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {GameViewer} from 'game-controller'
import {all, delay, fork} from 'typed-redux-saga'
import root from '../serverRoot'
import {broadcast} from '../utils/comm'
import {gameManagerSaga} from './game'
import {AIOpponentDefs} from 'common/utils/setup-game'

export function inGame(playerId: PlayerId) {
	return root
		.getGames()
		.some((game) => !!game.viewers.find((viewer) => viewer.id === playerId))
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

			if (player1 && player2) {
				playersToRemove.push(player1.id, player2.id)
				yield* fork(() =>
					gameManagerSaga({
						player1,
						player2,
						viewers: [
							{id: player1.id, type: 'player'},
							{id: player2.id, type: 'player'},
						],
					}),
				)
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


export function* createBossGame(
	msg: RecievedClientMessage<typeof clientMessages.CREATE_BOSS_GAME>,
) {
	const {playerId} = msg
	const player = root.players[playerId]
	if (!player) {
		console.log('[Create Boss game] Player not found: ', playerId)
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

	yield* gameManagerSaga({
		player1: player,
		player2: {
			name: 'Evil Xisuma',
			minecraftName: 'EvilXisuma',
			censoredName: 'Evil Xisuma',
			deck: [EvilXisumaBoss],
			virtualAI: ExBossAI,
			disableDeckingOut: true,
		},
		viewers: [{id: player.id, type: 'player'}],
		randomizeOrder: false,
	})
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
		(game) => game.props.spectatorCode === code,
	)

	if (spectatorGame) {
		console.log(
			`Spectator ${player.name} Joined private game. Code: ${spectatorGame.props.gameCode}`,
		)
		broadcast([player], {
			type: serverMessages.SPECTATE_PRIVATE_GAME_START,
			game: spectatorGame.startupInformation(),
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

		let viewers: Array<GameViewer> = [
			{id: existingPlayer.id, type: 'player'},
			{id: player.id, type: 'player'},
		]

		for (const playerId of root.privateQueue[code].spectatorsWaiting) {
			viewers.push({id: playerId, type: 'spectator'})
		}

		// Remove this game from the queue, it's started
		let tmpQueue = root.privateQueue[code]
		delete root.privateQueue[code]

		console.log(`Joining private game: ${player.name}.`, `Code: ${code}`)

		broadcast([player], {type: serverMessages.JOIN_PRIVATE_GAME_SUCCESS})

		if (tmpQueue.playerId) {
			broadcast([root.players[tmpQueue.playerId]], {
				type: serverMessages.JOIN_PRIVATE_GAME_SUCCESS,
			})
		}

		yield* gameManagerSaga({
			player1: existingPlayer,
			player2: player,
			viewers,
		})
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
