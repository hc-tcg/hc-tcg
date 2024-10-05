import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessageTable, localMessages} from 'messages'
import {getGame} from 'selectors'
import {select} from 'typed-redux-saga'
import {getOpponentId} from '../../utils'
import {broadcast} from '../../utils/comm'

export function* statusChangedSaga(
	action:
		| LocalMessageTable[typeof localMessages.PLAYER_RECONNECTED]
		| LocalMessageTable[typeof localMessages.PLAYER_DISCONNECTED],
) {
	const game = yield* select(getGame(action.player.id))
	if (!game) return

	const playerId = action.player.id
	const opponentId = getOpponentId(game, playerId)
	const connectionStatus = game.players[playerId]?.socket.connected

	if (!opponentId || !game.players[opponentId]) return

	broadcast([game.players[opponentId]], {
		type: serverMessages.OPPONENT_CONNECTION,
		isConnected: connectionStatus,
	})
}
