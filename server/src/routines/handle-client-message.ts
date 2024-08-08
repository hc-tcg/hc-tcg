import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {takeEvery} from 'typed-redux-saga'
import {chatMessage} from './background/chat'
import spectatorLeaveSaga from './background/spectators'
import {
	cancelPrivateGame,
	createPrivateGame,
	joinPrivateGame,
	joinQueue,
	leaveQueue,
} from './matchmaking'
import {
	loadUpdatesSaga,
	updateDeckSaga,
	updateMinecraftNameSaga,
} from './player'

function* handler(message: RecievedClientMessage) {
	switch (message.type) {
		case clientMessages.UPDATE_DECK:
			return yield* updateDeckSaga(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.UPDATE_MINECRAFT_NAME:
			return yield* updateMinecraftNameSaga(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.GET_UPDATES:
			return yield* loadUpdatesSaga(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.JOIN_QUEUE:
			return yield* joinQueue(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.LEAVE_QUEUE:
			return yield* leaveQueue(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CREATE_PRIVATE_GAME:
			return yield* createPrivateGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.JOIN_PRIVATE_GAME:
			return yield* joinPrivateGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.SPECTATOR_LEAVE:
			return yield* spectatorLeaveSaga(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CANCEL_PRIVATE_GAME:
			return yield* cancelPrivateGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CHAT_MESSAGE:
			return yield* chatMessage(
				message as RecievedClientMessage<typeof message.type>,
			)
	}
}

export default function* handleClientMessage() {
	yield* takeEvery('*', handler)
}
