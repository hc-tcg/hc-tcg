import {clientMessages} from 'common/socket-messages/client-messages'
import {localMessages} from 'logic/messages'
import {sendMsg} from 'logic/socket/socket-saga'
import {SagaIterator} from 'redux-saga'
import {takeEvery} from 'redux-saga/effects'

function* spectatorSaga(): SagaIterator {
	yield takeEvery(localMessages.GAME_SPECTATOR_LEAVE, function* () {
		yield sendMsg({type: clientMessages.SPECTATOR_LEAVE})
	})
}

export default spectatorSaga
