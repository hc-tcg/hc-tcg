import {PlayerEntity} from 'common/entities'
import {GameModel, GameProps} from 'common/models/game-model'
import setupGameSaga, {gameMessages, GameMessage} from 'common/routines/game'
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
import {isRegExp} from 'util'

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

	console.log('sending turn action')
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
	}
}

function* gameStateSaga(
	action: LocalMessageTable[typeof localMessages.GAME_LOCAL_STATE_RECIEVED],
) {
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

	if (gameState.turn.availableActions.includes('WAIT_FOR_TURN')) return
	if (gameState.turn.availableActions.includes('WAIT_FOR_OPPONENT_ACTION'))
		return

	const logic = yield* fork(() =>
		all([
			fork(actionModalsSaga),
			fork(slotSaga),
			fork(actionLogicSaga, gameState),
			fork(endTurnSaga),
			takeEvery(localMessages.GAME_ACTIONS_ATTACK, attackSaga),
		]),
	)

	// Handle core funcionality
	yield call(actionSaga, gameState.playerEntity)

	yield* cancel(logic)
}

function* handleGameTurnActionSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const message = yield* call(
			receiveMsg(socket, serverMessages.GAME_TURN_ACTION),
		)

		yield* put<GameMessage>({
			type: gameMessages.TURN_ACTION,
			action: message.action,
			playerEntity: message.playerEntity,
			time: message.time,
		})
	}
}

function* gameActionsSaga() {
	yield* takeLatest(localMessages.GAME_LOCAL_STATE_RECIEVED, gameStateSaga)
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
			if (history.time <= game.lastTurnActionTime) continue
			yield* put<GameMessage>(history)
		}
	}
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
	const socket = yield* select(getSocket)

	let isReadyToDisplay = false

	if (!reconnectInformation) isReadyToDisplay = true

	yield* setupGameSaga(props, {
		onGameStart: function* (game) {
			yield* fork(() =>
				all([
					fork(opponentConnectionSaga),
					fork(chatSaga),
					fork(spectatorSaga),
					fork(reconnectSaga, game),
					fork(gameActionsSaga),
					fork(handleGameTurnActionSaga),
				]),
			)

			const isSpectator = false

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
			if (!reconnectInformation) return
			let index = reconnectInformation.history.indexOf(action)
			if (index === reconnectInformation.history.length - 1) {
				isReadyToDisplay = true
				console.log('Sending set timer action')
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

	return

	try {
		yield* put<LocalMessage>({
			type: localMessages.GAME_START,
		})

		const result = yield* race({
			game: call(gameActionsSaga),
			gameEnd: call(receiveMsg(socket, serverMessages.GAME_END)),
			gameCrash: call(receiveMsg(socket, serverMessages.GAME_CRASH)),
			spectatorLeave: take(localMessages.GAME_SPECTATOR_LEAVE),
		})

		if (result.game) {
			throw new Error('Unexpected game ending')
		} else if (result.gameCrash) {
			console.log('Server error')
			yield put<LocalMessage>({
				type: localMessages.GAME_END_OVERLAY_SHOW,
				outcome: 'server_crash',
				reason: 'error',
			})
		} else if (result.gameEnd) {
			const {gameState: newGameState, outcome, reason} = result.gameEnd
			if (newGameState) {
				yield call(coinFlipSaga, newGameState)
				yield putResolve<LocalMessage>({
					type: localMessages.GAME_LOCAL_STATE_SET,
					localGameState: newGameState,
					time: Date.now(),
				})
			}
			yield put<LocalMessage>({
				type: localMessages.GAME_END_OVERLAY_SHOW,
				reason,
				outcome,
			})
		}
	} catch (err) {
		console.error('Client error: ', err)
		yield put<LocalMessage>({
			type: localMessages.GAME_END_OVERLAY_SHOW,
			outcome: 'client_crash',
			reason: 'error',
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
