import {localMessages} from 'logic/messages'
import {put, select, take} from 'typed-redux-saga'
import {getPlayerEntity} from '../game-selectors'

export default function* endTurnSaga() {
	while (true) {
		yield take(localMessages.GAME_TURN_END)
		const _playerEntity = yield* select(getPlayerEntity)
		yield* put({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'END_TURN',
			},
		})
	}
}
