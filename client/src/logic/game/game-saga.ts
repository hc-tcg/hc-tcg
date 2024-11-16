import {PlayerEntity} from 'common/entities'
import {GameModel, GameProps} from 'common/models/game-model'
import {Message, MessageTable, messages} from 'common/redux-messages'
import runGameSaga, {
	gameMessages,
	GameMessage,
	GameMessageTable,
} from 'common/routines/game'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {GameOutcome} from 'common/types/game-state'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {assert} from 'common/utils/assert'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {
	all,
	call,
	cancel,
	delay,
	fork,
	put,
	putResolve,
	race,
	take,
	takeEvery,
	takeLatest,
} from 'typed-redux-saga'
import {select} from 'typed-redux-saga'
import {getEndGameOverlay} from './game-selectors'
import {getLocalGameState} from './local-state'
import actionLogicSaga from './tasks/action-logic-saga'
import actionModalsSaga from './tasks/action-modals-saga'
import attackSaga from './tasks/attack-saga'
import chatSaga from './tasks/chat-saga'
import coinFlipSaga from './tasks/coin-flips-saga'
import endTurnSaga from './tasks/end-turn-saga'
import slotSaga from './tasks/slot-saga'
import spectatorSaga from './tasks/spectators'

const gameSagaMessages = messages('client-game-message', {
	GAME_END: null,
	GAME_STATE_DESYNC: null,
	GAME_ACTION_SAGA_OVER: null,
	WAITING_FOR_ACTION: null,
	LOCAL_STATE_UPDATED: null,
})

type GameSagaMessages = [
	{type: typeof gameSagaMessages.GAME_END; outcome: GameOutcome},
	{type: typeof gameSagaMessages.GAME_STATE_DESYNC},
	{type: typeof gameSagaMessages.GAME_ACTION_SAGA_OVER},
	{type: typeof gameSagaMessages.WAITING_FOR_ACTION},
	{type: typeof gameSagaMessages.LOCAL_STATE_UPDATED},
]

type GameSagaMessage = Message<GameSagaMessages>

type GameSagaMessageTable = MessageTable<GameSagaMessages>

export function* sendTurnAction(
	game: GameModel,
	entity: PlayerEntity,
	action: AnyTurnActionData,
) {
	let currentTime = Date.now()

	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		action: action,
		playerEntity: entity,
		gameId: game.id,
		time: currentTime,
	})

	yield* sendMsg({
		type: clientMessages.GAME_TURN_ACTION,
		action: action,
		playerEntity: entity,
		time: currentTime,
	})
}

function* actionSaga(game: GameModel, playerEntity: PlayerEntity) {
	const turnAction = yield* take<
		LocalMessageTable[typeof localMessages.GAME_TURN_ACTION]
	>(localMessages.GAME_TURN_ACTION)

	if (
		[
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD',
		].includes(turnAction.action.type)
	) {
		// This is updated for the client in slot-saga
		yield* call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'APPLY_EFFECT') {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'REMOVE_EFFECT') {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'PICK_REQUEST') {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'MODAL_REQUEST') {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (
		['SINGLE_USE_ATTACK', 'PRIMARY_ATTACK', 'SECONDARY_ATTACK'].includes(
			turnAction.action.type,
		)
	) {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'END_TURN') {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'CHANGE_ACTIVE_HERMIT') {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'FORFEIT') {
		yield call(sendTurnAction, game, playerEntity, turnAction.action)
	}
}

function* gameStateSaga(
	game: GameModel,
	action: LocalMessageTable[typeof localMessages.GAME_LOCAL_STATE_RECIEVED],
) {
	let logic: any
	try {
		// First show coin flips, if any
		yield* call(coinFlipSaga, action.localGameState)

		// Actually update the local state
		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_SET,
			localGameState: action.localGameState,
			time: action.time,
		})

		yield* put<GameSagaMessage>({
			type: gameSagaMessages.LOCAL_STATE_UPDATED,
		})

		yield* put<LocalMessage>({
			type: localMessages.QUEUE_VOICE,
			lines: action.localGameState.voiceLineQueue,
		})

		logic = yield* fork(() =>
			all([
				call(slotSaga),
				call(actionLogicSaga, action.localGameState),
				call(endTurnSaga),
				takeEvery(localMessages.GAME_ACTIONS_ATTACK, attackSaga),
			]),
		)

		yield* put({type: gameSagaMessages.WAITING_FOR_ACTION})

		yield call(actionSaga, game, action.localGameState.playerEntity)
	} finally {
		yield* cancel(logic)
	}
}

function* handleGameTurnActionSaga(game: GameModel) {
	const socket = yield* select(getSocket)
	while (true) {
		const message = yield* call(
			receiveMsg(socket, serverMessages.GAME_TURN_ACTION),
		)

		// If the message time is handled, we already handled the message.
		// Messages on the same milisecond are probably not going to happen.
		if (!game.handledActions.includes(message.time)) {
			yield* putResolve<GameMessage>({
				type: gameMessages.TURN_ACTION,
				action: message.action,
				playerEntity: message.playerEntity,
				gameId: game.id,
				time: message.time,
			})

			yield* take<GameSagaMessage>(gameSagaMessages.LOCAL_STATE_UPDATED)
		}

		if (game.getStateHash() !== message.gameStateHash) {
			console.error(
				'Desync between client and server detected:',
				game.getStateHash(),
				message.gameStateHash,
			)
			yield* put({type: gameSagaMessages.GAME_STATE_DESYNC})
		}
	}
}

function* gameActionsSaga(game: GameModel, playerEntity?: PlayerEntity) {
	yield* fork(function* () {
		let saga = yield* takeLatest(
			localMessages.GAME_LOCAL_STATE_RECIEVED,
			(
				action: LocalMessageTable[typeof localMessages.GAME_LOCAL_STATE_RECIEVED],
			) => gameStateSaga(game, action),
		)

		yield* take(gameMessages.GAME_END)
		yield* take(gameSagaMessages.WAITING_FOR_ACTION)

		yield* cancel(saga)

		yield* put<GameSagaMessage>({
			type: gameSagaMessages.GAME_ACTION_SAGA_OVER,
		})
	})

	yield* put<LocalMessage>({
		type: localMessages.GAME_LOCAL_STATE_RECIEVED,
		localGameState: getLocalGameState(game, playerEntity),
		time: Date.now(),
	})
}

function* opponentConnectionSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const action = yield* call(
			receiveMsg(socket, serverMessages.OPPONENT_CONNECTION),
		)
		yield* put<LocalMessage>({
			type: localMessages.GAME_OPPONENT_CONNECTION_SET,
			connected: action.isConnected,
		})
	}
}

function* reconnectSaga(game: GameModel) {
	const socket = yield* select(getSocket)
	while (true) {
		const action = yield* call(
			receiveMsg(socket, serverMessages.PLAYER_RECONNECTED),
		)

		assert(
			action.game?.history,
			'There should be a game history because the player is in a game',
		)

		for (const history of action.game.history) {
			if (
				history.type === gameMessages.TURN_ACTION &&
				history.time <= game.lastTurnActionTime
			)
				continue
			yield* put<GameMessage>(history)
		}
	}
}

/** Run a game until completion */
function* runGame(
	props: GameProps,
	playerEntity?: PlayerEntity,
	reconnectInformation?: {
		history: Array<GameMessage>
		timer: {
			turnRemaining: number
			turnStartTime: number
		}
	},
) {
	let isReadyToDisplay = false
	let backgroundTasks: any

	if (!reconnectInformation) isReadyToDisplay = true

	// Don't log the board state to prevent cheating by looking at the logs.
	props.settings.logBoardState = false

	const gameSaga = runGameSaga(props, {
		onGameStart: function* (game) {
			backgroundTasks = yield* fork(() =>
				all([
					call(actionModalsSaga),
					call(opponentConnectionSaga),
					call(chatSaga),
					call(spectatorSaga),
					call(reconnectSaga, game),
					call(gameActionsSaga, game, playerEntity),
					call(handleGameTurnActionSaga, game),
				]),
			)

			if (isReadyToDisplay) {
				// Set the first local state
				yield* putResolve<LocalMessage>({
					type: localMessages.GAME_LOCAL_STATE_RECIEVED,
					localGameState: getLocalGameState(game, playerEntity),
					time: Date.now(),
				})

				yield* put<LocalMessage>({
					type: localMessages.GAME_START,
				})
			}

			// Update the game state with the information from the reload
			if (!reconnectInformation) return
			if (reconnectInformation.history.length !== 0) {
				yield* fork(function* () {
					for (const h of reconnectInformation.history) {
						yield* put<GameMessage>(h)
					}
				})
			} else {
				isReadyToDisplay = true
				yield* fork(function* () {
					yield* put<GameMessage>({
						type: gameMessages.TURN_ACTION,
						playerEntity: game.currentPlayerEntity,
						gameId: game.id,
						action: {
							type: 'SET_TIMER',
							turnRemaining: reconnectInformation.timer.turnRemaining,
							turnStartTime: reconnectInformation.timer.turnStartTime,
						},
						time: Date.now(),
					})
					yield* put<LocalMessage>({
						type: localMessages.GAME_START,
					})
				})
			}
		},
		update: function* (game) {
			if (!isReadyToDisplay) return

			yield* put<LocalMessage>({
				type: localMessages.GAME_LOCAL_STATE_RECIEVED,
				localGameState: getLocalGameState(game, playerEntity),
				time: Date.now(),
			})
		},
		onTurnAction: function* (action, game) {
			if (!reconnectInformation || isReadyToDisplay) return
			let index = reconnectInformation.history.indexOf(action)
			if (index === reconnectInformation.history.length - 1) {
				isReadyToDisplay = true
				yield* put<GameMessage>({
					type: gameMessages.TURN_ACTION,
					playerEntity: game.currentPlayerEntity,
					gameId: game.id,
					action: {
						type: 'SET_TIMER',
						turnRemaining: reconnectInformation.timer.turnRemaining,
						turnStartTime: reconnectInformation.timer.turnStartTime,
					},
					time: Date.now(),
				})
				yield* put<LocalMessage>({
					type: localMessages.GAME_START,
				})
			}
		},
		delay: function* (ms) {
			if (!isReadyToDisplay) return
			yield* delay(ms)
		},
	})

	yield* fork(() => gameSaga)

	let message = (yield* take<GameMessage>(
		gameMessages.GAME_END,
	)) as GameMessageTable[typeof gameMessages.GAME_END]

	yield* take(gameSagaMessages.GAME_ACTION_SAGA_OVER)

	yield* cancel(backgroundTasks)

	yield* put({type: gameSagaMessages.GAME_END, outcome: message.outcome})
}

function* requestGameReconnectInformation() {
	let socket = yield* select(getSocket)

	yield* sendMsg({
		type: clientMessages.REQUEST_GAME_RECONNECT_INFORMATION,
	})

	return yield* call(
		receiveMsg(socket, serverMessages.GAME_RECONNECT_INFORMATION),
	)
}

function* runGamesUntilCompletion(
	props: GameProps,
	playerEntity?: PlayerEntity,
	reconnectInformation?: {
		history: Array<GameMessage>
		timer: {
			turnRemaining: number
			turnStartTime: number
		}
	},
) {
	while (true) {
		let gameTask = yield* fork(
			runGame,
			props,
			playerEntity,
			reconnectInformation,
		)

		let result = yield* race({
			gameEnd: take<GameMessageTable[typeof gameSagaMessages.GAME_END]>(
				gameSagaMessages.GAME_END,
			),
			gameStateDesync: take(gameSagaMessages.GAME_STATE_DESYNC),
			spectatorLeave: take(localMessages.GAME_SPECTATOR_LEAVE),
		})

		if (result.gameEnd) {
			yield* put<GameSagaMessage>({
				type: gameSagaMessages.GAME_END,
				outcome: result.gameEnd.outcome,
			})
			yield* cancel()
			break
		} else if (result.gameStateDesync) {
			console.error('Client and server desync detected. Attempting to fix...')
			yield* cancel(gameTask)
			reconnectInformation = yield* requestGameReconnectInformation()
			continue
		} else if (result.spectatorLeave) {
			yield* cancel()
			break
		}
	}
}

function* gameSaga(
	props: GameProps,
	playerEntity?: PlayerEntity,
	reconnectInformation?: {
		history: Array<GameMessage>
		timer: {
			turnRemaining: number
			turnStartTime: number
		}
	},
) {
	try {
		yield* fork(
			runGamesUntilCompletion,
			props,
			playerEntity,
			reconnectInformation,
		)

		let gameOutcome = yield* take<
			GameSagaMessageTable[typeof gameSagaMessages.GAME_END]
		>(gameSagaMessages.GAME_END)

		yield put<LocalMessage>({
			type: localMessages.GAME_END_OVERLAY_SHOW,
			outcome: gameOutcome.outcome,
		})
	} catch (err) {
		// @todo Handle client crash
		console.error('Client error: ', err)
	} finally {
		const hasOverlay = yield* select(getEndGameOverlay)
		if (hasOverlay) yield take(localMessages.GAME_END_OVERLAY_HIDE)
		yield put<LocalMessage>({type: localMessages.GAME_END})
	}
}

export default gameSaga
