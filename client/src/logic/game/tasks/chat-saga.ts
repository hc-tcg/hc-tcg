import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {SagaIterator} from 'redux-saga'
import {call, fork, put, select, takeEvery} from 'typed-redux-saga'

function* chatMessageSaga(
	action: LocalMessageTable[typeof localMessages.CHAT_MESSAGE],
): SagaIterator {
	yield* sendMsg({type: clientMessages.CHAT_MESSAGE, message: action.message})
}

function* receiveMessagesSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(receiveMsg(socket, serverMessages.CHAT_UPDATE))
		const messages = result.messages.slice().reverse()
		yield* put<LocalMessage>({type: localMessages.CHAT_UPDATE, messages})
	}
}

function* chatSaga(): SagaIterator {
	try {
		yield* takeEvery(localMessages.CHAT_MESSAGE, chatMessageSaga)
		yield* fork(receiveMessagesSaga)
	} catch (err) {
		console.error('Chat error: ', err)
	}
}

export default chatSaga
