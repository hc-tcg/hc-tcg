import {put} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {GameState} from 'types/game-state'

function* gameStateSaga(gameState: GameState): SagaIterator {
	// yield put({type: 'SET_OPENED_MODAL_ID', payload: 'spyglass'})
	// ...
}

export default gameStateSaga
