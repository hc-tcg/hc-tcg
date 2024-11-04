import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessageTable, localMessages} from 'messages'
import {getGame} from 'selectors'
import {select} from 'typed-redux-saga'

export function* statusChangedSaga(
	action:
		| LocalMessageTable[typeof localMessages.PLAYER_RECONNECTED]
		| LocalMessageTable[typeof localMessages.PLAYER_DISCONNECTED],
) {
	const game = yield* select(getGame(action.player.id))
	if (!game) return

	const connectionStatus = action.player.socket.connected

	game.broadcastToViewers({
		type: serverMessages.OPPONENT_CONNECTION,
		isConnected: connectionStatus,
	})
}
