import {takeEvery, fork, delay} from 'redux-saga/effects'
import {broadcast} from '../../utils/comm'
import {getOpponentId} from '../../utils'
import {CONFIG} from 'common/config'
import {getLocalGameState} from '../../utils/state-gen'
import {GameModel} from 'common/models/game-model'
import {AnyAction} from 'redux'
import {SagaIterator} from 'redux-saga'

function* sendGameStateOnReconnect(game: GameModel, action: AnyAction): SagaIterator {
	const {playerId} = action.payload
	const player = game.players[playerId]
	const opponentId = getOpponentId(game, playerId)
	const opponent = game.players[opponentId]

	yield delay(1000)
	if (!game.turnState) return // @TODO we may not need this anymore
	const {availableActions, opponentAvailableActions} = game.turnState

	if (game.state.timer.turnTime) {
		const maxTime = CONFIG.limits.maxTurnTime * 1000
		const remainingTime = game.state.timer.turnTime + maxTime - Date.now()
		const graceTime = 1000
		game.state.timer.turnRemaining = Math.floor((remainingTime + graceTime) / 1000)
	}

	const payload = {
		localGameState: getLocalGameState(
			game,
			player,
			playerId === game.currentPlayer.id ? availableActions : opponentAvailableActions
		),
	}
	broadcast([player], 'GAME_STATE_ON_RECONNECT', payload)
	broadcast([player], 'OPPONENT_CONNECTION', !!opponent.socket?.connected)
}

function* statusChangedSaga(game: GameModel, action: AnyAction): SagaIterator {
	const playerId = action.payload.playerId
	const opponentId = getOpponentId(game, action.payload.playerId)
	const connectionStatus = game.players[playerId]?.socket.connected
	broadcast([game.players[opponentId]], 'OPPONENT_CONNECTION', connectionStatus)
}

function* connectionStatusSaga(game: GameModel): SagaIterator {
	yield takeEvery(
		(action: any) =>
			action.type === 'PLAYER_RECONNECTED' && !!game.players[action.payload.playerId],
		sendGameStateOnReconnect,
		game
	)

	yield takeEvery(
		(action: any) =>
			['PLAYER_DISCONNECTED', 'PLAYER_RECONNECTED'].includes(action.type) &&
			!!game.players[action.payload.playerId],
		statusChangedSaga,
		game
	)
}

export default connectionStatusSaga
