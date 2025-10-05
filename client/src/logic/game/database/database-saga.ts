import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {SagaIterator} from 'redux-saga'
import {call, takeEvery} from 'redux-saga/effects'
import {put, select} from 'typed-redux-saga'

function* setDatabaseKeysSaga(
	action: LocalMessageTable[typeof localMessages.SET_ID_AND_SECRET],
): SagaIterator {
	localStorage.setItem('databaseInfo:userId', action.userId)
	localStorage.setItem('databaseInfo:secret', action.secret)
}

function* resetDatabaseKeysSaga(): SagaIterator {
	localStorage.removeItem('databaseInfo:userId')
	localStorage.removeItem('databaseInfo:secret')
}

function* resetSecretSaga(): SagaIterator {
	const socket = yield* select(getSocket)
	localStorage.removeItem('databaseInfo:secret')

	yield* sendMsg({type: clientMessages.RESET_SECRET})

	const {secret} = yield call(receiveMsg(socket, serverMessages.SECRET_RESET))
	localStorage.setItem('databaseInfo:secret', secret)
	yield* put<LocalMessage>({type: localMessages.LOGOUT})
}

function* databaseSaga() {
	yield takeEvery(localMessages.SET_ID_AND_SECRET, setDatabaseKeysSaga)
	yield takeEvery(localMessages.RESET_ID_AND_SECRET, resetDatabaseKeysSaga)
	yield takeEvery(localMessages.RESET_SECRET, resetSecretSaga)
}

export default databaseSaga
