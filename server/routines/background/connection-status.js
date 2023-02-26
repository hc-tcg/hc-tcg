import {takeEvery, fork, delay} from 'redux-saga/effects'
import {broadcast} from '../../utils/comm'
import profanityFilter from '../../utils/profanity'
import {getOpponentId} from '../../utils'

/**
 * @param {Game} game
 */
function* sendGameStateOnReconnect(game) {
	yield takeEvery(
		(action) =>
			action.type === 'PLAYER_RECONNECTED' &&
			!!game.players[action.payload.playerId],
		function* (action) {
			const {playerId} = action.payload
			const player = game.players[playerId]
			const opponentId = getOpponentId(game, playerId)
			const opponent = game.players[opponentId]

			yield delay(1000)
			if (!game._derivedStateCache) return // @TODO we may not need this anymore
			const {currentPlayer, availableActions, opponentAvailableActions} =
				game._derivedStateCache

			const payload = {
				gameState: game.state,
				opponentId: Object.keys(game.players).find((id) => id !== playerId),
				availableActions:
					playerId === currentPlayer.id
						? availableActions
						: opponentAvailableActions,
			}
			broadcast([player], 'GAME_STATE', payload)
			broadcast([player], 'OPPONENT_CONNECTION', !!opponent.socket?.connected)
		}
	)
}

function* connectionStatusSaga(game) {
	yield fork(sendGameStateOnReconnect, game)

	yield takeEvery(
		(action) =>
			['PLAYER_DISCONNECTED', 'PLAYER_RECONNECTED'].includes(action.type) &&
			game.getPlayerIds().includes(action.payload.playerId),
		function* (action) {
			const playerId = action.payload.playerId
			const opponentId = getOpponentId(game, action.payload.playerId)
			const connectionStatus = game.players[playerId]?.socket.connected
			broadcast(
				[game.players[opponentId]],
				'OPPONENT_CONNECTION',
				connectionStatus
			)
		}
	)
}

export default connectionStatusSaga
