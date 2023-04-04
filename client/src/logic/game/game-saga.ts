import {
	all,
	take,
	takeEvery,
	fork,
	call,
	put,
	race,
	takeLatest,
	cancel,
} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {AnyAction} from 'redux'
import {SagaIterator} from 'redux-saga'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import slotSaga from './tasks/slot-saga'
import actionLogicSaga from './tasks/action-logic-saga'
import attackSaga from './tasks/attack-saga'
import chatSaga from './tasks/chat-saga'
import coinFlipSaga from './tasks/coin-flips-saga'
import {
	gameState,
	gameStart,
	gameEnd,
	showEndGameOverlay,
	setOpponentConnection,
} from './game-actions'
import {getEndGameOverlay} from './game-selectors'
import {LocalGameState} from 'common/types/game-state'

function* actionSaga(): SagaIterator {
	const turnAction = yield race({
		playCard: take('PLAY_CARD'),
		applyEffect: take('APPLY_EFFECT'),
		removeEffect: take('REMOVE_EFFECT'),
		followUp: take('FOLLOW_UP'),
		attack: take('ATTACK'),
		endTurn: take('END_TURN'),
		changeActiveHermit: take('CHANGE_ACTIVE_HERMIT'),
	})

	if (turnAction.playCard) {
		yield call(sendMsg, 'PLAY_CARD', turnAction.playCard.payload)
	} else if (turnAction.applyEffect) {
		yield call(sendMsg, 'APPLY_EFFECT', turnAction.applyEffect.payload)
	} else if (turnAction.removeEffect) {
		yield call(sendMsg, 'REMOVE_EFFECT')
	} else if (turnAction.followUp) {
		yield call(sendMsg, 'FOLLOW_UP', turnAction.followUp.payload)
	} else if (turnAction.attack) {
		yield call(sendMsg, 'ATTACK', turnAction.attack.payload)
	} else if (turnAction.endTurn) {
		yield call(sendMsg, 'END_TURN')
	} else if (turnAction.changeActiveHermit) {
		yield call(
			sendMsg,
			'CHANGE_ACTIVE_HERMIT',
			turnAction.changeActiveHermit.payload
		)
	}
}

function* gameStateSaga(action: AnyAction): SagaIterator {
	const gameState: LocalGameState = action.payload.localGameState

	if (gameState.availableActions.includes('WAIT_FOR_TURN')) return
	if (gameState.availableActions.includes('WAIT_FOR_OPPONENT_FOLLOWUP')) return

	// handle user clicking on board
	yield fork(slotSaga)
	// some cards have special logic bound to them
	yield fork(actionLogicSaga, gameState)
	// attack logic
	yield takeEvery('START_ATTACK', attackSaga)
	// handles core funcionality
	yield fork(actionSaga)
}

function* gameActionsSaga(initialGameState?: LocalGameState): SagaIterator {
	yield takeEvery('FORFEIT', function* () {
		yield call(sendMsg, 'FORFEIT')
	})
	yield takeLatest('GAME_STATE', gameStateSaga)
	yield fork(coinFlipSaga)

	console.log('Game started')
	if (initialGameState) {
		yield put(gameState(initialGameState))
	}

	while (true) {
		const {payload} = yield call(receiveMsg, 'GAME_STATE')
		yield put(gameState(payload.localGameState))
	}
}

function* opponentConnectionSaga(): SagaIterator {
	while (true) {
		const message = yield call(receiveMsg, 'OPPONENT_CONNECTION')
		yield put(setOpponentConnection(message.payload))
	}
}

function* gameSaga(initialGameState?: LocalGameState): SagaIterator {
	const backgroundTasks = yield all([
		fork(opponentConnectionSaga),
		fork(chatSaga),
	])
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
					gameState({
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
