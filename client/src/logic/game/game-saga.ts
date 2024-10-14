import {PlayerEntity} from 'common/entities'
import {GameModel, GameProps} from 'common/models/game-model'
import {messages} from 'common/redux-messages'
import runGameSaga, {
	gameMessages,
	GameMessage,
	GameMessageTable,
} from 'common/routines/game'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalGameState} from 'common/types/game-state'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {assert} from 'common/utils/assert'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {
	all,
	call,
	cancel,
	fork,
	put,
	putResolve,
	race,
	take,
	takeEvery,
	takeLatest,
} from 'typed-redux-saga'
import {select} from 'typed-redux-saga'
import {getEndGameOverlay, getIsSpectator} from './game-selectors'
import {getLocalGameState} from './local-state'
import actionLogicSaga from './tasks/action-logic-saga'
import actionModalsSaga from './tasks/action-modals-saga'
import attackSaga from './tasks/attack-saga'
import chatSaga from './tasks/chat-saga'
import coinFlipSaga from './tasks/coin-flips-saga'
import endTurnSaga from './tasks/end-turn-saga'
import slotSaga from './tasks/slot-saga'
import spectatorSaga from './tasks/spectators'

const clientGameMessages = messages('client-game-message', {
	GAME_END: null,
	GAME_STATE_DESYNC: null,
})

export function* sendTurnAction(
	entity: PlayerEntity,
	action: AnyTurnActionData,
) {
	let currentTime = Date.now()

	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		action: action,
		playerEntity: entity,
		time: currentTime,
	})

	yield* sendMsg({
		type: clientMessages.GAME_TURN_ACTION,
		action: action,
		playerEntity: entity,
		time: currentTime,
	})
}

function* actionSaga(playerEntity: PlayerEntity) {
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
		yield* call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'APPLY_EFFECT') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'REMOVE_EFFECT') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'PICK_REQUEST') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'MODAL_REQUEST') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (
		['SINGLE_USE_ATTACK', 'PRIMARY_ATTACK', 'SECONDARY_ATTACK'].includes(
			turnAction.action.type,
		)
	) {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'END_TURN') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'CHANGE_ACTIVE_HERMIT') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	} else if (turnAction.action.type === 'FORFEIT') {
		yield call(sendTurnAction, playerEntity, turnAction.action)
	}
}

function* gameStateSaga(
	action: LocalMessageTable[typeof localMessages.GAME_LOCAL_STATE_RECIEVED],
) {
	let logic: any
	try {
		const gameState: LocalGameState = action.localGameState

		// First show coin flips, if any
		yield* call(coinFlipSaga, gameState)

		// Actually update the local state
		yield* put<LocalMessage>({
			type: localMessages.GAME_LOCAL_STATE_SET,
			localGameState: gameState,
			time: action.time,
		})

		yield* put<LocalMessage>({
			type: localMessages.QUEUE_VOICE,
			lines: gameState.voiceLineQueue,
		})

		logic = yield* fork(() =>
			all([
				call(slotSaga),
				call(actionLogicSaga, gameState),
				call(endTurnSaga),
				takeEvery(localMessages.GAME_ACTIONS_ATTACK, attackSaga),
			]),
		)

		yield call(actionSaga, gameState.playerEntity)
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
				time: message.time,
			})
		}

		if (game.getStateHash() !== message.gameStateHash) {
			// There was a desync between the client as server, @todo Fix it
			console.log(
				'Desync detected:',
				game.getStateHash(),
				message.gameStateHash,
			)
		}
	}
}

function* gameActionsSaga(
	game: GameModel,
	playerEntity: PlayerEntity,
	isSpectator: boolean,
) {
	yield* takeLatest(localMessages.GAME_LOCAL_STATE_RECIEVED, gameStateSaga)
	yield* put<LocalMessage>({
		type: localMessages.GAME_LOCAL_STATE_RECIEVED,
		localGameState: getLocalGameState(game, playerEntity, isSpectator),
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
	playerEntity: PlayerEntity,
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

	const gameSaga = runGameSaga(props, {
		onGameStart: function* (game) {
			const isSpectator = false

			backgroundTasks = yield* fork(() =>
				all([
					call(actionModalsSaga),
					call(opponentConnectionSaga),
					call(chatSaga),
					call(spectatorSaga),
					call(reconnectSaga, game),
					call(gameActionsSaga, game, playerEntity, isSpectator),
					call(handleGameTurnActionSaga, game),
				]),
			)

			if (isReadyToDisplay) {
				// Set the first local state
				yield* putResolve<LocalMessage>({
					type: localMessages.GAME_LOCAL_STATE_SET,
					localGameState: getLocalGameState(game, playerEntity, isSpectator),
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

			const isSpectator = yield* select(getIsSpectator)

			yield* put<LocalMessage>({
				type: localMessages.GAME_LOCAL_STATE_RECIEVED,
				localGameState: getLocalGameState(game, playerEntity, isSpectator),
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
	})

	yield* fork(() => gameSaga)

	yield* take<GameMessage>(gameMessages.GAME_END)
}

function* requestGameState() {
	let socket = yield* select(getSocket)

	yield* sendMsg({
		type: clientMessages.REQUEST_GAME_HISTORY,
	})

	return yield* call(receiveMsg(socket, serverMessages.GAME_HISTORY))
}

function* gameSaga(
	props: GameProps,
	playerEntity: PlayerEntity,
	reconnectInformation?: {
		history: Array<GameMessage>
		timer: {
			turnRemaining: number
			turnStartTime: number
		}
	},
) {
	while (true) {
		yield* fork(runGame, props, playerEntity, reconnectInformation)

		let result = yield* race({
			gameEnd: clientGameMessages.GAME_END,
			gameStateDesync: clientGameMessages.GAME_STATE_DESYNC,
			// @todo Spectator leave
		})

		if (result.gameEnd) {
			break
		} else if (result.gameStateDesync) {
			let history = yield* requestGameState()
			console.log(history)
			continue
		}
	}

	try {
		const result = yield* race({
			// @todo Change to different message type
			game: take(gameMessages.GAME_END),
			spectatorLeave: take(localMessages.GAME_SPECTATOR_LEAVE),
		})

		if (result.game) {
			let gameOutcome =
				result.game as GameMessageTable[typeof gameMessages.GAME_END]
			yield put<LocalMessage>({
				type: localMessages.GAME_END_OVERLAY_SHOW,
				outcome: gameOutcome.outcome,
			})
		} else if (result.spectatorLeave) {
		}
	} catch (err) {
		console.error('Client error: ', err)
		yield put<LocalMessage>({
			type: localMessages.GAME_END_OVERLAY_SHOW,
		})
	} finally {
		const hasOverlay = yield* select(getEndGameOverlay)
		if (hasOverlay) yield take(localMessages.GAME_END_OVERLAY_HIDE)
		console.log('Game ended')
		yield put<LocalMessage>({type: localMessages.GAME_END})
		yield cancel(backgroundTasks)
	}
}

export default gameSaga
