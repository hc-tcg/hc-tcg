import {LocalMessage, localMessages, LocalMessageTable} from 'messages'
import {takeEvery} from 'typed-redux-saga'
import {playerConnectedSaga, playerDisconnectedSaga} from './player'

function* handler(message: LocalMessage) {
	switch (message.type) {
		case localMessages.CLIENT_CONNECTED:
			return yield* playerConnectedSaga(
				message as LocalMessageTable[typeof message.type],
			)
		case localMessages.CLIENT_DISCONNECTED:
			return yield* playerDisconnectedSaga(
				message as LocalMessageTable[typeof message.type],
			)
	}
}

export default function* handleLocalMessage() {
	yield* takeEvery('*', handler)
}
