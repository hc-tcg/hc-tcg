import {
	take,
	takeEvery,
	fork,
	call,
	put,
	race,
	takeLatest,
} from 'redux-saga/effects'
import {AnyAction} from 'redux'
import {SagaIterator} from 'redux-saga'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import slotSaga from './tasks/slot-saga'
import actionLogicSaga from './tasks/action-logic-saga'
import attackSaga from './tasks/attack-saga'
import {gameState, gameStart, gameEnd} from './game-actions'

function* actionSaga(): SagaIterator {
	try {
		console.log('ACTION SAGA START')
		const turnAction = yield race({
			playCard: take('PLAY_CARD'),
			applyEffect: take('APPLY_EFFECT'),
			followUp: take('FOLLOW_UP'),
			attack: take('ATTACK'),
			endTurn: take('END_TURN'),
			changeActiveHermit: take('CHANGE_ACTIVE_HERMIT'),
		})

		// TODO - consider what is being send to backend and in which format
		if (turnAction.playCard) {
			yield call(sendMsg, 'PLAY_CARD', turnAction.playCard.payload)
		} else if (turnAction.applyEffect) {
			yield call(sendMsg, 'APPLY_EFFECT', turnAction.applyEffect.payload)
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
	} catch (err) {
		console.log(err)
	} finally {
		console.log('ACTION SAGA END')
	}
}

function* gameStateSaga(action: AnyAction): SagaIterator {
	const {availableActions, gameState} = action.payload

	if (availableActions.includes('WAIT_FOR_TURN')) return
	if (availableActions.includes('WAIT_FOR_OPPONENT_FOLLOWUP')) return

	// handle user clicking on board
	yield fork(slotSaga)
	// some cards have special logic bound to them
	yield fork(actionLogicSaga, gameState)
	// attack logic
	yield takeEvery('START_ATTACK', attackSaga)
	// handles core funcionality
	yield fork(actionSaga)
}

function* gameActionsSaga(initialGameState?: any): SagaIterator {
	yield takeEvery('FORFEIT', function* () {
		yield call(sendMsg, 'FORFEIT')
	})
	yield takeLatest('GAME_STATE', gameStateSaga)

	console.log('Game started')
	if (initialGameState) {
		yield put(gameState(initialGameState))
	}

	while (true) {
		const {payload} = yield call(receiveMsg, 'GAME_STATE')
		yield put(gameState(payload))
	}
}

function* gameSaga(initialGameState?: any): SagaIterator {
	try {
		yield put(gameStart())
		const result = yield race({
			game: call(gameActionsSaga, initialGameState),
			gameEnd: call(receiveMsg, 'GAME_END'),
			gameCrash: call(receiveMsg, 'GAME_CRASH'),
		})

		if (result.hasOwnProperty('game')) {
			throw new Error('Unexpected game ending')
		}

		if (result.gameCrash) {
			console.log('Server error')
		}
	} catch (err) {
		console.error('Client error: ', err)
	} finally {
		console.log('Game ended')
		yield put(gameEnd())
	}
}

export default gameSaga
