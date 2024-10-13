import {LocalMessage, localMessages} from 'logic/messages'
import {put, take} from 'typed-redux-saga'

export default function* endTurnSaga() {
	while (true) {
		yield take(localMessages.GAME_TURN_END)
		console.log('Sending game turn end action')
		yield* put<LocalMessage>({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'END_TURN',
			},
		})
	}
}
