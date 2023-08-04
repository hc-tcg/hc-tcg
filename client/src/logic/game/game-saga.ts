import {all, take, takeEvery, fork, call, put, race, cancel} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {SagaIterator} from 'redux-saga'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import slotSaga from './tasks/slot-saga'
import actionLogicSaga from './tasks/action-logic-saga'
import attackSaga from './tasks/attack-saga'
import chatSaga from './tasks/chat-saga'
import coinFlipSaga from './tasks/coin-flips-saga'
import {
	localGameState,
	gameStart,
	gameEnd,
	showEndGameOverlay,
	setOpponentConnection,
} from './game-actions'
import {getEndGameOverlay} from './game-selectors'
import {LocalGameState} from 'common/types/game-state'

function* actionSaga(gameState: LocalGameState): SagaIterator {
	const turnAction = yield race({
		playCard: take([
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD',
		]),
		applyEffect: take('APPLY_EFFECT'),
		removeEffect: take('REMOVE_EFFECT'),
		followUp: take('FOLLOW_UP'),
		attack: take(['ZERO_ATTACK', 'PRIMARY_ATTACK', 'SECONDARY_ATTACK']),
		endTurn: take('END_TURN'),
		changeActiveHermit: take('CHANGE_ACTIVE_HERMIT'),
	})

	if (turnAction.playCard) {
		yield call(sendMsg, turnAction.playCard.type, turnAction.playCard.payload)
	} else if (turnAction.applyEffect) {
		yield call(sendMsg, 'APPLY_EFFECT', turnAction.applyEffect.payload)
	} else if (turnAction.removeEffect) {
		yield call(sendMsg, 'REMOVE_EFFECT')
	} else if (turnAction.followUp) {
		yield call(sendMsg, 'FOLLOW_UP', turnAction.followUp.payload)
	} else if (turnAction.attack) {
		yield call(sendMsg, turnAction.attack.type, turnAction.attack.payload)
	} else if (turnAction.endTurn) {
		yield call(sendMsg, 'END_TURN')
	} else if (turnAction.changeActiveHermit) {
		yield call(sendMsg, 'CHANGE_ACTIVE_HERMIT', turnAction.changeActiveHermit.payload)
	}
}

function* gameStateSaga(gameState: LocalGameState): SagaIterator {
	// Call coin flip saga before anything else
	yield call(coinFlipSaga, gameState)

	// Update the state object locally
	yield put(localGameState(gameState))

	console.log('Available Actions:', gameState.turn.availableActions)

	// If we should not be doing anything wait for another state update
	if (gameState.turn.availableActions.includes('WAIT_FOR_TURN')) return
	if (gameState.turn.availableActions.includes('WAIT_FOR_OPPONENT_FOLLOWUP')) return

	// Handle user clicking on board
	const slotSagaRef = yield fork(slotSaga)
	// Handle special card logic
	const actionLogicSagaRef = yield fork(actionLogicSaga, gameState)
	// Attack logic
	const attackSagaRef = yield takeEvery('START_ATTACK', attackSaga)

	console.log('waiting for action')

	// Wait till we send a message to the server
	yield call(actionSaga, gameState)

	// Disable logic
	yield cancel(slotSagaRef)
	yield cancel(actionLogicSagaRef)
	yield cancel(attackSagaRef)
}

function* gameActionsSaga(initialGameState?: LocalGameState): SagaIterator {
	yield takeEvery('FORFEIT', function* () {
		yield call(sendMsg, 'FORFEIT')
	})

	console.log('Game started')
	if (initialGameState) {
		yield call(gameStateSaga, initialGameState)
	}

	while (true) {
		// Wait to receive game state
		const gameStateData = yield call(receiveMsg, 'GAME_STATE')
		const gameState: LocalGameState = gameStateData.payload.localGameState

		// Run the game state saga, which ends once we send a message to the server
		yield call(gameStateSaga, gameState)

		// And the cycle repeats, nothing more can happen on the client now till we receive the next game state
	}
}

function* opponentConnectionSaga(): SagaIterator {
	while (true) {
		const message = yield call(receiveMsg, 'OPPONENT_CONNECTION')
		yield put(setOpponentConnection(message.payload))
	}
}

function* gameSaga(initialGameState?: LocalGameState): SagaIterator {
	const backgroundTasks = yield all([fork(opponentConnectionSaga), fork(chatSaga)])
	try {
		yield put(gameStart())
		const result = yield race({
			game: call(gameActionsSaga, initialGameState),
			gameEnd: call(receiveMsg, 'GAME_END'),
			gameCrash: call(receiveMsg, 'GAME_CRASH'),
		})

		if (Object.hasOwn(result, 'game')) {
			throw new Error('Unexpected game ending')
		} else if (Object.hasOwn(result, 'gameCrash')) {
			console.log('Server error')
			yield put(showEndGameOverlay('server_crash'))
		} else if (Object.hasOwn(result, 'gameEnd')) {
			const {gameState: newGameState, outcome, reason} = result.gameEnd.payload
			if (newGameState) {
				yield put(
					localGameState({
						...newGameState,
						availableActions: [],
					})
				)
			}
			yield put(showEndGameOverlay(outcome, reason))
		}
	} catch (err) {
		console.error('Client error: ', err)
		yield put(showEndGameOverlay('client_crash'))
	} finally {
		const hasOverlay = yield* select(getEndGameOverlay)
		if (hasOverlay) yield take('SHOW_END_GAME_OVERLAY')
		console.log('Game ended')
		yield put(gameEnd())
		yield cancel(backgroundTasks)
	}
}

export default gameSaga
