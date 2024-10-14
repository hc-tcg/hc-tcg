import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {LocalMessage, localMessages} from 'messages'
import {put, select, takeEvery} from 'typed-redux-saga'
import {safeCall} from 'utils'
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
import {getGame} from 'selectors'
import {broadcast} from 'utils/comm'
import root from 'serverRoot'
import {serverMessages} from 'common/socket-messages/server-messages'
import {assert} from 'common/utils/assert'

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
		case clientMessages.GAME_TURN_ACTION:
			let actionMessage = message as RecievedClientMessage<typeof message.type>
			return yield* put<LocalMessage>({
				type: localMessages.GAME_TURN_ACTION,
				action: actionMessage.payload.action,
				playerEntity: actionMessage.payload.playerEntity,
				time: actionMessage.payload.time,
			})
		case clientMessages.REQUEST_GAME_HISTORY:
			let game = yield* select(getGame(message.playerId))
			assert(
				game,
				'The player should be in a game when they send the `REQUEST_GAME_HISTORY` message',
			)

			broadcast([root.players[message.playerId]], {
				type: serverMessages.GAME_HISTORY,
				history: game.history,
			})

			return
	}
}

export default function* handleClientMessage() {
	yield* takeEvery('*', safeCall, handler)
}
