import {select, take} from 'typed-redux-saga'
import {call, put, fork} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {GameState} from 'types/game-state'
import {RootState} from 'store'
import {runPickProcessSaga} from './pick-process-saga'
import {PlayerState} from 'types/game-state'

function* borrowSaga(pState: PlayerState): SagaIterator {
	yield put({type: 'SET_OPENED_MODAL_ID', payload: 'borrow'})
	const result = yield* take(['BORROW_ATTACH', 'BORROW_DISCARD'])
	if (result.type === 'BORROW_DISCARD') {
		yield put({type: 'FOLLOW_UP', payload: {pickedCards: []}})
		return
	}

	const pickedCards = yield call(runPickProcessSaga, pState.followUp)
	yield put({type: 'FOLLOW_UP', payload: {pickedCards}})
}

function* gameStateSaga(gameState: GameState): SagaIterator {
	const playerId = yield* select((state: RootState) => state.playerId)
	const pState = gameState.players[playerId]
	if (pState.followUp) {
		console.log('@followup')
		if (['looting'].includes(pState.followUp)) {
			const pickedCards = yield call(runPickProcessSaga, pState.followUp)
			yield put({type: 'FOLLOW_UP', payload: {pickedCards}})
		} else if (pState.followUp === 'grian_rare') {
			console.log('@grian_rare')
			yield fork(borrowSaga, pState)
		}
	}
}

export default gameStateSaga
