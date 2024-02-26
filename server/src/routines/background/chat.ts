import {takeEvery} from 'typed-redux-saga'
import {broadcast} from '../../utils/comm'
import profanityFilter from '../../../../common/utils/profanity'
import {PlayerModel} from 'common/models/player-model'
import {GameModel} from 'common/models/game-model'
import {AnyAction} from 'redux'
import {MessageTextT} from 'common/types/game-state'
import {HERMIT_CARDS} from 'common/cards'

type MessageChunk = {
	message: string
	type: 'emoji' | 'text'
}

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

	var splitMessage: Array<MessageChunk> = [
		{
			message: message,
			type: 'text',
		},
	]

	hermitNames.forEach((name) => {
		splitMessage = splitMessage.flatMap((chunk) => {
			if (chunk.type === 'emoji') return chunk
			const splitString = chunk.message.split(new RegExp('(:' + name.shortName + ':)', 'g'))
			const formattedSplitString: Array<MessageChunk> = []
			splitString.forEach((chunk) => {
				if (chunk === '') return
				const colonlessChunk = chunk.substring(1, chunk.length - 1)
				formattedSplitString.push({
					message: colonlessChunk === name.shortName ? name.longName : chunk,
					type: colonlessChunk === name.shortName ? 'emoji' : 'text',
				})
			})
			return formattedSplitString
		})
	})

	const messageArray = splitMessage.map((chunk) => {
		if (chunk.type === 'emoji') {
			return {
				text: `images/hermits-emoji/${chunk.message}.png`,
				censoredText: '',
				alt: chunk.message,
				format: 'image',
			}
		}
		return {
			text: chunk.message,
			censoredText: profanityFilter(chunk.message),
			format: 'plain',
		}
	})

	game.chat.push({
		createdAt: Date.now(),
		message: messageArray,
		playerId,
		systemMessage: false,
	})
	broadcast(game.getPlayers(), 'CHAT_UPDATE', game.chat)
}

function* chatSaga(game: GameModel) {
	yield* takeEvery(gameAction('CHAT_MESSAGE', game), chatMessageSaga, game)
}

export default chatSaga
