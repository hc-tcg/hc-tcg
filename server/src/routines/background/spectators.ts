import {ViewerComponent} from 'common/components/viewer-component'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {formatText} from 'common/utils/formatting'
import {getGame} from 'selectors'
import {select} from 'typed-redux-saga'
import {broadcast} from 'utils/comm'

function* spectatorLeaveSaga(
	action: RecievedClientMessage<typeof clientMessages.SPECTATOR_LEAVE>,
) {
	let game = yield* select(getGame(action.playerId))
	if (!game) return

	let viewer = game.components.find(
		ViewerComponent,
		(_game, component) => component.playerId === action.playerId,
	)

	game.chat.push({
		sender: {
			type: 'viewer',
			id: action.playerId,
		},
		message: formatText(`$s${viewer?.player.name}$ $ystopped spectating$`),
		createdAt: Date.now(),
	})

	broadcast(game.getPlayers(), {
		type: serverMessages.CHAT_UPDATE,
		messages: game.chat,
	})

	if (viewer) game.components.delete(viewer.entity)
}

export default spectatorLeaveSaga
