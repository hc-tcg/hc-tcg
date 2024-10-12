import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {getGame} from 'selectors'
import {select} from 'typed-redux-saga'

function* spectatorLeaveSaga(
	action: RecievedClientMessage<typeof clientMessages.SPECTATOR_LEAVE>,
) {
	let game = yield* select(getGame(action.playerId))
	if (!game) return

	let viewer = game.components.find(
		ViewerComponent,
		(_game, component) => component.playerId === action.playerId,
	)
	if (viewer) game.components.delete(viewer.entity)
}

export default spectatorLeaveSaga
