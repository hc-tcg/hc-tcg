import {ViewerComponent} from 'common/components/viewer-component'
import {CONFIG} from 'common/config'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessageTable, localMessages} from 'messages'
import {getGame} from 'selectors'
import {delay, select} from 'typed-redux-saga'
import {getOpponentId} from '../../utils'
import {broadcast} from '../../utils/comm'
import {getLocalGameState} from '../../utils/state-gen'

export function* sendGameStateOnReconnect(
	action: LocalMessageTable[typeof localMessages.PLAYER_RECONNECTED],
) {
	const game = yield* select(getGame(action.player.id))
	if (!game) return

	const playerId = action.player.id
	const player = game.players[playerId]

	yield* delay(500)

	if (game.state.timer.turnStartTime) {
		const maxTime = CONFIG.limits.maxTurnTime * 1000
		const remainingTime = game.state.timer.turnStartTime + maxTime - Date.now()
		const graceTime = 1000
		game.state.timer.turnRemaining = remainingTime + graceTime
	}

	let viewer = game.components.find(
		ViewerComponent,
		(_game, viewer) => viewer.playerId === player.id,
	)

	if (!viewer) {
		console.error('Player tried to connect with invalid player id')
		return
	}

	broadcast([player], {
		type: serverMessages.GAME_STATE_ON_RECONNECT,
		localGameState: getLocalGameState(game, viewer),
		order: game.getPlayers().map((player) => player.id),
	})
}

export function* statusChangedSaga(
	action:
		| LocalMessageTable[typeof localMessages.PLAYER_RECONNECTED]
		| LocalMessageTable[typeof localMessages.PLAYER_DISCONNECTED],
) {
	const game = yield* select(getGame(action.player.id))
	if (!game) return

	const playerId = action.player.id
	const opponentId = getOpponentId(game, playerId)
	if (!opponentId) return
	const connectionStatus = game.players[playerId]?.socket.connected
	broadcast([game.players[opponentId]], {
		type: serverMessages.OPPONENT_CONNECTION,
		isConnected: connectionStatus,
	})
}
