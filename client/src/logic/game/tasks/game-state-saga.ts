import {select, take} from 'typed-redux-saga'
import {call, put, fork} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {GameState} from 'types/game-state'
import {runPickProcessSaga} from './pick-process-saga'
import {PlayerState} from 'types/game-state'

import {getPlayerId} from 'logic/session/session-selectors'
import {setOpenedModalId, followUp} from 'logic/game/game-actions'

function* borrowSaga(pState: PlayerState): SagaIterator {
	yield put(setOpenedModalId('borrow'))
	const result = yield* take(['BORROW_ATTACH', 'BORROW_DISCARD'])
	if (result.type === 'BORROW_DISCARD') {
		yield put(followUp({}))
		return
	}

	const pickedCards = yield call(runPickProcessSaga, pState.followUp)
	yield put(followUp({pickedCards: {[pState.followUp]: pickedCards}}))
}

function* gameStateSaga(gameState: GameState): SagaIterator {
	const playerId = yield* select(getPlayerId)
	const pState = gameState.players[playerId]
	if (pState.followUp) {
		if (['looting', 'tangotek_rare'].includes(pState.followUp)) {
			const pickedCards = yield call(runPickProcessSaga, pState.followUp)
			yield put(followUp({pickedCards: {[pState.followUp]: pickedCards}}))
		} else if (pState.followUp === 'grian_rare') {
			yield fork(borrowSaga, pState)
		}
	}
}

export default gameStateSaga
