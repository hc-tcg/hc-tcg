import {takeEvery} from 'typed-redux-saga'
import {broadcast} from '../../utils/comm'
import profanityFilter from '../../../../common/utils/profanity'
import {PlayerModel} from 'common/models/player-model'
import {GameModel} from 'common/models/game-model'
import {AnyAction} from 'redux'
import {VirtualPlayerModel} from 'common/models/virtual-player-model'

const gameAction =
	(type: string, game: {players: Record<string, PlayerModel | VirtualPlayerModel>}) =>
	(action: any) => {
		return action.type === type && !!game.players[action.playerId]
	}

function* chatMessageSaga(game: GameModel, action: AnyAction) {
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

function* chatSaga(game: GameModel) {
	yield* takeEvery(gameAction('CHAT_MESSAGE', game), chatMessageSaga, game)
}

export default chatSaga
