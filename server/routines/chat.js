import {takeEvery, all} from 'redux-saga/effects'
import gameSaga from './game'

const gameAction = (type, playerIds) => (action) => {
	return action.type === type && playerIds.includes(action.playerId)
}

const broadcast = (allPlayers, playerIds, type, payload = {}) => {
	playerIds.forEach((playerId) => {
		const playerSocket = allPlayers[playerId]?.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(type, {type: type, payload})
		}
	})
}

function* chatSaga(allPlayers, gamePlayerIds, game) {
	yield takeEvery(
		gameAction('CHAT_MESSAGE', gamePlayerIds),
		function* (action) {
			const {payload: message, playerId} = action
			if (typeof message !== 'string') return
			if (message.length < 1) return
			if (message.length > 140) return
			game.chat.push({
				createdAt: Date.now(),
				message,
				playerId,
			})
			broadcast(allPlayers, gamePlayerIds, 'CHAT_UPDATE', game.chat)
		}
	)
}

export default chatSaga
