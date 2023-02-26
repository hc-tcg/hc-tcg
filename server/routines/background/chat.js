import {takeEvery} from 'redux-saga/effects'
import {broadcast} from '../../utils/comm'
import profanityFilter from '../../utils/profanity'

/**
 * @typedef {import("models/game-model").GameModel} GameModel
 * @typedef {import("redux").AnyAction} AnyAction
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 */

/**
 * @param {string} type
 * @param {GameModel} game
 */
const gameAction = (type, game) => (action) => {
	return action.type === type && !!game.players[action.playerId]
}

/**
 * @param {GameModel} game
 * @param {AnyAction} action
 * @returns {SagaIterator}
 */
function* chatMessageSaga(game, action) {
	const {payload: message, playerId} = action
	if (typeof message !== 'string') return
	if (message.length < 1) return
	if (message.length > 140) return
	game.chat.push({
		createdAt: Date.now(),
		message,
		censoredMessage: profanityFilter(message),
		playerId,
	})
	broadcast(game.getPlayers(), 'CHAT_UPDATE', game.chat)
}

/**
 * @param {GameModel} game
 * @returns {SagaIterator}
 */
function* chatSaga(game) {
	yield takeEvery(gameAction('CHAT_MESSAGE', game), chatMessageSaga, game)
}

export default chatSaga
