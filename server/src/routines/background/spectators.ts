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
	let con = yield* select(getGame(action.playerId))
	if (!con) return

	let viewer = con.viewers.find(
		(viewer) => viewer.player.id === action.playerId,
	)

	con.chat.push({
		sender: {
			type: 'spectator',
			entityOrId: action.playerId,
		},
		message: formatText(`$s${viewer?.player.name}$ $ystopped spectating$`),
		createdAt: Date.now(),
	})

	con.chatUpdate()

	if (viewer) con.removeViewer(viewer)

	if (con.viewers.length === 0) {
		con.game.outcome = {type: 'no-viewers'}
	}
}

export default spectatorLeaveSaga
