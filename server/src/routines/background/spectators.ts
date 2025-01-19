import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {formatText} from 'common/utils/formatting'
import {getGame} from 'selectors'
import {select} from 'typed-redux-saga'

function* spectatorLeaveSaga(
	action: RecievedClientMessage<typeof clientMessages.SPECTATOR_LEAVE>,
) {
	let game = yield* select(getGame(action.playerId))
	if (!game) return

	let viewer = game.viewers.find(
		(viewer) => viewer.player.id === action.playerId,
	)

	game.chat.push({
		sender: {
			type: 'viewer',
			id: action.playerId,
		},
		message: formatText(`$s${viewer?.player.name}$ $ystopped spectating$`),
		createdAt: Date.now(),
	})

	game.chatUpdate()

	if (viewer) game.removeViewer(viewer)
}

export default spectatorLeaveSaga
