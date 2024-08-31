import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {LocalMessage, localMessages} from 'messages'
import {put, takeEvery} from 'typed-redux-saga'
import {safeCall} from 'utils'
import {chatMessage} from './background/chat'
import {
	cancelPrivateGame,
	createBossGame,
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
		case clientMessages.CREATE_BOSS_GAME:
			return yield* createBossGame(
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
		case clientMessages.CANCEL_PRIVATE_GAME:
			return yield* cancelPrivateGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CHAT_MESSAGE:
			return yield* chatMessage(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.TURN_ACTION:
			let actionMessage = message as RecievedClientMessage<typeof message.type>
			yield* put<LocalMessage>({
				type: localMessages.GAME_TURN_ACTION,
				action: actionMessage.payload.action,
				playerEntity: actionMessage.payload.playerEntity,
			})
	}
}

export default function* handleClientMessage() {
	yield* takeEvery('*', safeCall, handler)
}
