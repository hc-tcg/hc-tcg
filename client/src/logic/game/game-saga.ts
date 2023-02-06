import {
	take,
	takeEvery,
	fork,
	call,
	put,
	race,
	cancel,
} from 'redux-saga/effects'
import {SagaIterator, Task} from 'redux-saga'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import slotSaga from './tasks/slot-saga'
import gameStateSaga from './tasks/game-state-saga'
import attackSaga from './tasks/attack-saga'
import {gameState, gameStart, gameEnd} from './game-actions'

function* actionSaga(actionTask: Task | null): SagaIterator {
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
		const result = yield call(attackSaga, turnAction.attack)
		yield call(sendMsg, 'ATTACK', result)
	} else if (turnAction.endTurn) {
		yield call(sendMsg, 'END_TURN')
	} else if (turnAction.changeActiveHermit) {
		yield call(
			sendMsg,
			'CHANGE_ACTIVE_HERMIT',
			turnAction.changeActiveHermit.payload
		)
	}

	if (actionTask) yield cancel(actionTask)
}

function* gameActionsSaga(initialGameState?: any): SagaIterator {
	let slotTask = null
	let actionTask = null
	yield takeEvery('FORFEIT', function* () {
		yield call(sendMsg, 'FORFEIT')
	})
	action_cycle: while (true) {
		const {payload} = initialGameState || (yield call(receiveMsg, 'GAME_STATE'))
		initialGameState = null

		if (slotTask) yield cancel(slotTask)
		if (actionTask) yield cancel(actionTask)

		yield put(gameState(payload))

		if (payload.availableActions.includes('WAIT_FOR_TURN')) continue
		if (payload.availableActions.includes('WAIT_FOR_OPPONENT_FOLLOWUP'))
			continue

		slotTask = yield fork(slotSaga)
		yield fork(gameStateSaga, payload.gameState)

		actionTask = yield fork(actionSaga, actionTask)
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
		yield put(gameEnd())
	}
}

export default gameSaga
