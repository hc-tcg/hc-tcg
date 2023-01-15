import {take, spawn, race} from 'redux-saga/effects'
import gameSaga from './game'

function* matchmakingSaga(allPlayers) {
	while (true) {
		const firstRequest = yield take('JOIN_GAME')
		console.log('first player waiting')
		const result = yield race({
			secondRequest: take('JOIN_GAME'),
			disconnected: take(
				(action) =>
					action.type === 'PLAYER_DISCONNECTED' &&
					firstRequest.playerId === action.playerId
			),
		})
		if (result.secondRequest) {
			console.log('second player connected, starting game')
			// TODO - use singleton for all players map instead?
			yield spawn(gameSaga, allPlayers, [
				firstRequest.playerId,
				result.secondRequest.playerId,
			])
		}
	}
}

export default matchmakingSaga
