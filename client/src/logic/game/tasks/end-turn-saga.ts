import {localMessages} from 'logic/messages'
import {select, take} from 'typed-redux-saga'
import {getPlayerEntity} from '../game-selectors'
import {sendTurnAction} from '../game-saga'

export default function* endTurnSaga() {
	while (true) {
		yield take(localMessages.GAME_TURN_END)
		const playerEntity = yield* select(getPlayerEntity)
		yield* sendTurnAction(playerEntity, {
			type: 'END_TURN',
		})
	}
}
