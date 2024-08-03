import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import {
	FormatNode,
	PlaintextNode,
	concatFormattedTextNodes,
	formatText,
} from 'common/utils/formatting'
import {AnyAction} from 'redux'
import {takeEvery} from 'typed-redux-saga'
import {broadcast} from '../../utils/comm'

const gameAction =
	(type: string, game: {players: Record<string, PlayerModel>}) =>
	(action: any) => {
		return action.type === type && !!game.players[action.playerId]
	}

function* chatMessageSaga(game: GameModel, action: AnyAction) {
	const {payload: message, playerId} = action
	if (typeof message !== 'string') return
	if (message.length < 1) return
	if (message.length > 140) return

	const isSpectator = game.components.find(
		ViewerComponent,
		(_game, component) => component.player.id === playerId,
	)?.spectator

	game.chat.push({
		sender: {
			type: 'viewer',
			id: playerId,
		},
		message: concatFormattedTextNodes(
			FormatNode(
				isSpectator ? 'spectator' : 'player',
				PlaintextNode(`${game.players[playerId].name}`),
			),
			formatText(message, {
				censor: true,
				'enable-$': false,
			}),
		),
		createdAt: Date.now(),
	})
	broadcast(game.getPlayers(), 'CHAT_UPDATE', game.chat)
}

function* chatSaga(game: GameModel) {
	yield* takeEvery(gameAction('CHAT_MESSAGE', game), chatMessageSaga, game)
}

export default chatSaga
