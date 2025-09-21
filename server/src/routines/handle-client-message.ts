import assert from 'assert'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {LocalMessage, localMessages} from 'messages'
import {getGame} from 'selectors'
import {put, select, takeEvery} from 'typed-redux-saga'
import {safeCall} from 'utils'
import {
	deleteDeck,
	deleteTag,
	exportDeck,
	getDecks,
	getOverview,
	grabCurrentImport,
	importDeck,
	insertDeck,
	insertDecks,
	setShowData,
	updateDeck,
} from '../db/db-reciever'
import {chatMessage} from './background/chat'
import spectatorLeaveSaga from './background/spectators'
import {
	cancelPrivateGame,
	cancelRematch,
	createBossGame,
	createPrivateGame,
	createRematchGame,
	createReplayGame,
	joinPrivateGame,
	joinPublicQueue,
	leavePrivateQueue,
	leavePublicQueue,
	leaveRematchGame,
	spectatePrivateGame,
} from './matchmaking'
import {
	loadUpdatesSaga,
	resetSecret,
	updateCosmeticSaga,
	updateMinecraftNameSaga,
	updateUsernameSaga,
} from './player'

function* handler(message: RecievedClientMessage) {
	switch (message.type) {
		case clientMessages.UPDATE_USERNAME:
			return yield* updateUsernameSaga(
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
		case clientMessages.JOIN_PUBLIC_QUEUE:
			return yield* joinPublicQueue(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.LEAVE_PUBLIC_QUEUE:
			return yield* leavePublicQueue(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CREATE_BOSS_GAME:
			return yield* createBossGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CREATE_REMATCH_GAME:
			return yield* createRematchGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CREATE_PRIVATE_GAME:
			return yield* createPrivateGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.JOIN_PRIVATE_QUEUE:
			return yield* joinPrivateGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.SPECTATE_PRIVATE_GAME:
			return yield* spectatePrivateGame(
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
		case clientMessages.LEAVE_REMATCH_GAME:
			return yield* leaveRematchGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CANCEL_REMATCH:
			return yield* cancelRematch(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CREATE_REPLAY_GAME:
			return yield* createReplayGame(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.CHAT_MESSAGE:
			return yield* chatMessage(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.TURN_ACTION:
			let actionMessage = message as RecievedClientMessage<typeof message.type>
			let game = yield* select(getGame(actionMessage.playerId))
			assert(game, 'Player should be in game if sending a turn action message')
			return yield* put<LocalMessage>({
				type: localMessages.GAME_TURN_ACTION,
				action: actionMessage.payload.action,
				playerEntity: actionMessage.payload.playerEntity,
				game: game.id,
			})
		case clientMessages.GET_DECKS:
			return yield* getDecks(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.INSERT_DECK:
			return yield* insertDeck(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.UPDATE_DECK:
			return yield* updateDeck(
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
		case clientMessages.EXPORT_DECK:
			return yield* exportDeck(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.GRAB_CURRENT_IMPORT:
			return yield* grabCurrentImport(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.MAKE_INFO_PUBLIC:
			return yield* setShowData(
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
		case clientMessages.SET_COSMETIC:
			return yield* updateCosmeticSaga(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.REPLAY_OVERVIEW:
			return yield* getOverview(
				message as RecievedClientMessage<typeof message.type>,
			)
		case clientMessages.RESET_SECRET:
			return yield* resetSecret(
				message as RecievedClientMessage<typeof message.type>,
			)
	}
}

export default function* handleClientMessage() {
	yield* takeEvery('*', safeCall, handler)
}
