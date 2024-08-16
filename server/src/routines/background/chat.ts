import {ViewerComponent} from 'common/components/viewer-component'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {
	FormatNode,
	PlaintextNode,
	concatFormattedTextNodes,
	formatText,
} from 'common/utils/formatting'
import {getGame} from 'selectors'
import {select} from 'typed-redux-saga'
import {broadcast} from '../../utils/comm'

export function* chatMessage(
	action: RecievedClientMessage<typeof clientMessages.CHAT_MESSAGE>,
) {
	let game = yield* select(getGame(action.playerId))
	if (!game) return

	const {
		payload: {message},
		playerId,
	} = action
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
			PlaintextNode(' '),
			formatText(message, {
				censor: true,
				'enable-$': false,
			}),
		),
		createdAt: Date.now(),
	})
	broadcast(game.getPlayers(), {
		type: serverMessages.CHAT_UPDATE,
		messages: game.chat,
	})
}
