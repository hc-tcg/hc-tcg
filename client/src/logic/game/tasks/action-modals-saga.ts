import {LocalMessage, actions} from 'logic/actions'
import {SagaIterator} from 'redux-saga'
import {fork, put, take} from 'redux-saga/effects'

function* attackActionSaga(): SagaIterator {
	while (true) {
		yield take('ATTACK_ACTION')
		yield put<LocalMessage>({
			type: actions.GAME_MODAL_OPENED_SET,
			id: 'attack',
		})
	}
}

function* endTurnActionSaga(): SagaIterator {
	while (true) {
		yield take('END_TURN_ACTION')
		yield put<LocalMessage>({
			type: actions.GAME_MODAL_OPENED_SET,
			id: 'end-turn',
		})
	}
}

// this routes requests to open modals for action buttons
// that means we can disable the buttons if we want to, by cancelling this saga
// e.g between sending a message and receivng a response from the server we don't want the attack button to do anything

function* actionModalsSaga(): SagaIterator {
	yield fork(attackActionSaga)
	yield fork(endTurnActionSaga)
}

export default actionModalsSaga
