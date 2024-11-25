import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {LocalMessage, localMessages} from 'messages'
import {put, takeEvery} from 'typed-redux-saga'
import {safeCall} from 'utils'
import {
	addUser,
	authenticateUser,
	deleteDeck,
	deleteTag,
	getDecks,
	getStats,
	importDeck,
	insertDeck,
	insertDecks,
} from '../db/db-reciever'
import {chatMessage} from './background/chat'
import spectatorLeaveSaga from './background/spectators'
import {
	cancelPrivateGame,
	createBossGame,
	createPrivateGame,
	joinPrivateGame,
	joinQueue,
	leavePrivateQueue,
	leaveQueue,
} from './matchmaking'
import {
	loadUpdatesSaga,
	updateDeckSaga,
	updateMinecraftNameSaga,
} from './player'

function* handler(message: RecievedClientMessage) {
	switch (message.type) {
		case clientMessages.SELECT_DECK:
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
		case clientMessages.SPECTATOR_LEAVE:
			return yield* spectatorLeaveSaga(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CANCEL_PRIVATE_GAME:
			return yield* cancelPrivateGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.LEAVE_PRIVATE_QUEUE:
			return yield* leavePrivateQueue(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CHAT_MESSAGE:
			return yield* chatMessage(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.TURN_ACTION:
			let actionMessage = message as RecievedClientMessage<typeof message.type>
			console.log(actionMessage.payload.action)
			return yield* put<LocalMessage>({
				type: localMessages.GAME_TURN_ACTION,
				action: actionMessage.payload.action,
				playerEntity: actionMessage.payload.playerEntity,
			})
		case clientMessages.PG_INSERT_USER:
			return yield* addUser(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.PG_AUTHENTICATE:
			return yield* authenticateUser(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.GET_DECKS:
			return yield* getDecks(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.INSERT_DECK:
			return yield* insertDeck(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.INSERT_DECKS:
			return yield* insertDecks(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.IMPORT_DECK:
			return yield* importDeck(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.DELETE_DECK:
			return yield* deleteDeck(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.DELETE_TAG:
			return yield* deleteTag(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.GET_STATS:
			return yield* getStats(
				message as RecievedClientMessage<typeof message.type>,
			)
	}
}

export default function* handleClientMessage() {
	yield* takeEvery('*', safeCall, handler)
}
