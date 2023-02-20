import {takeEvery, all} from 'redux-saga/effects'
import {broadcast} from '../utils'
import {Game} from '../classes/game'

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
		broadcast(Object.values(game.players), 'CHAT_UPDATE', game.chat)
	})
}

export default chatSaga
