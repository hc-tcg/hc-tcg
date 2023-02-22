import {takeEvery} from 'redux-saga/effects'
import {broadcast} from '../utils/comm'

/**
 * @typedef {import("models/game-model").Game} Game
 */

/**
 * @param {string} type
 * @param {Game} game
 */
const gameAction = (type, game) => (action) => {
	return action.type === type && !!game.players[action.playerId]
}

/**
 * @param {Game} game
 */
function* chatSaga(game) {
	yield takeEvery(gameAction('CHAT_MESSAGE', game), function* (action) {
		const {payload: message, playerId} = action
		if (typeof message !== 'string') return
		if (message.length < 1) return
		if (message.length > 140) return
		game.chat.push({
			createdAt: Date.now(),
			message,
			playerId,
		})
		broadcast(game.getPlayers(), 'CHAT_UPDATE', game.chat)
	})
}

export default chatSaga
