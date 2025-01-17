import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {
	FormatNode,
	PlaintextNode,
	concatFormattedTextNodes,
	formatText,
} from 'common/utils/formatting'
import {getGame} from 'selectors'
import {select} from 'typed-redux-saga'

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

	const isSpectator = game.viewers.find(
		(viewer) => viewer.player.id === playerId,
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
			formatText(` ${message}`, {
				censor: true,
				'enable-$': false,
			}),
		),
		createdAt: Date.now(),
	})

	game.chatUpdate()
}
