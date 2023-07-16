import {takeEvery} from 'redux-saga/effects'
import {broadcast} from '../../utils/comm'
import profanityFilter from '../../utils/profanity'
import {PlayerModel} from '../../models/player-model'
import {GameModel} from '../../models/game-model'
import {AnyAction} from 'redux'
import {SagaIterator} from 'redux-saga'

const gameAction =
	(type: string, game: {players: Record<string, PlayerModel>}) => (action: any) => {
		return action.type === type && !!game.players[action.playerId]
	}

function* chatMessageSaga(game: GameModel, action: AnyAction): SagaIterator {
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

function* chatSaga(game: GameModel): SagaIterator {
	yield takeEvery(gameAction('CHAT_MESSAGE', game), chatMessageSaga, game)
}

export default chatSaga
