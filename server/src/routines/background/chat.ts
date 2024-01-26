import {takeEvery} from 'typed-redux-saga'
import {broadcast} from '../../../../common/utils/comm'
import profanityFilter from '../../../../common/utils/profanity'
import {PlayerModel} from 'common/models/player-model'
import {GameModel} from 'common/models/game-model'
import {AnyAction} from 'redux'
import {MessageTextT} from 'common/types/game-state'
import {HERMIT_CARDS} from 'common/cards'

const gameAction =
	(type: string, game: {players: Record<string, PlayerModel>}) => (action: any) => {
		return action.type === type && !!game.players[action.playerId]
	}

function* chatMessageSaga(game: GameModel, action: AnyAction) {
	const {payload: message, playerId} = action
	if (typeof message !== 'string') return
	if (message.length < 1) return
	if (message.length > 140) return

	const hermitNames = Object.values(HERMIT_CARDS).map((card) => {
		return {shortName: card.name.toLowerCase().replace(' ', '_'), longName: card.id.split('_')[0]}
	})

	var splitMessage = [message]

	hermitNames.forEach((name) => {
		splitMessage = splitMessage.flatMap((chunk) => {
			return chunk.split(new RegExp('(:' + name.shortName + ':)', 'g'))
		})
	})

	const filteredSplitMessage = splitMessage.filter((chunk) => chunk !== '')

	const messageArray = filteredSplitMessage.map((chunk) => {
		if (chunk[0] === ':' && chunk[chunk.length - 1] === ':') {
			var fullEmojiName = ''
			hermitNames.forEach((name) => {
				if (chunk.substring(1, chunk.length - 1) === name.shortName) fullEmojiName = name.longName
			})
			return {
				text: `images/hermits-emoji/${fullEmojiName}.png`,
				format: 'image',
			}
		}
		return {
			text: chunk,
			format: 'plain',
		}
	})

	game.chat.push({
		createdAt: Date.now(),
		message: messageArray,
		censoredMessage: messageArray.map((msg) => (msg.text = profanityFilter(msg.text))),
		playerId,
		systemMessage: false,
	})
	broadcast(game.getPlayers(), 'CHAT_UPDATE', game.chat)
}

function* chatSaga(game: GameModel) {
	yield* takeEvery(gameAction('CHAT_MESSAGE', game), chatMessageSaga, game)
}

export default chatSaga
