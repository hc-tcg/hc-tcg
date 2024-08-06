import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {actions, LocalMessage, LocalMessageTable} from 'logic/actions'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {SagaIterator} from 'redux-saga'
import {call, fork, put, takeEvery} from 'typed-redux-saga'

function* chatMessageSaga(
	action: LocalMessageTable[typeof actions.CHAT_MESSAGE],
): SagaIterator {
	yield* call(
		sendMsg({type: clientMessages.CHAT_MESSAGE, message: action.message}),
	)
}

function* receiveMessagesSaga() {
	while (true) {
		const result = yield* call(receiveMsg(serverMessages.CHAT_UPDATE))
		const messages = result.messages.slice().reverse()
		yield* put<LocalMessage>({type: actions.CHAT_UPDATE, messages})
	}
}

function* chatSaga(): SagaIterator {
	try {
		yield* takeEvery(actions.CHAT_MESSAGE, chatMessageSaga)
		yield* fork(receiveMessagesSaga)
	} catch (err) {
		console.error('Chat error: ', err)
	}
}

export default chatSaga
