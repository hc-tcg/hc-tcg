import {LocalMessage, LocalMessageTable, localMessages} from 'messages'
import {all, call, takeEvery} from 'typed-redux-saga'
import {
	sendGameStateOnReconnect,
	statusChangedSaga,
} from './background/connection-status'
import {playerConnectedSaga, playerDisconnectedSaga} from './player'
import { safeCall } from 'utils'

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
		case localMessages.PLAYER_RECONNECTED:
			return yield* all([
				call(
					sendGameStateOnReconnect,
					message as LocalMessageTable[typeof message.type],
				),
				call(
					statusChangedSaga,
					message as LocalMessageTable[typeof message.type],
				),
			])
		case localMessages.PLAYER_DISCONNECTED:
			return yield* statusChangedSaga(
				message as LocalMessageTable[typeof message.type],
			)
	}
}

export default function* handleLocalMessage() {
	yield* takeEvery('*', safeCall, handler)
}
