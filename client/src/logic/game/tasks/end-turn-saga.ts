import {clientMessages} from 'common/socket-messages/client-messages'
import {localMessages} from 'logic/messages'
import {sendMsg} from 'logic/socket/socket-saga'
import {select, take} from 'typed-redux-saga'
import {getPlayerEntity} from '../game-selectors'

export default function* endTurnSaga() {
	while (true) {
		yield take(localMessages.GAME_TURN_END)
		const playerEntity = yield* select(getPlayerEntity)
		yield* sendMsg({
			type: clientMessages.TURN_ACTION,
			playerEntity,
			action: {
				type: 'END_TURN',
			},
		})
	}
}
