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
	game.viewers = game.viewers.filter(id => id.id != action.playerId)
}

export default spectatorLeaveSaga
