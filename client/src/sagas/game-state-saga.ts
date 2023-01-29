import {select} from 'typed-redux-saga'
import {call, put} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {GameState} from 'types/game-state'
import {RootState} from 'store'
import {runPickProcessSaga} from './pick-process-saga'

function* gameStateSaga(gameState: GameState): SagaIterator {
	const playerId = yield* select((state: RootState) => state.playerId)
	const pSate = gameState.players[playerId]
	if (pSate.effectStep) {
		const suCard = pSate.board.singleUseCard
		if (suCard?.cardId === 'looting') {
			const pickedCards = yield call(runPickProcessSaga, suCard?.cardId)
			yield put({type: 'EFFECT_STEP', payload: {pickedCards}})
		}
	}
}

export default gameStateSaga
