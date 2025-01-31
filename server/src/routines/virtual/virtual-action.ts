import {AIComponent} from 'common/components/ai-component'
import {delay, put} from 'typed-redux-saga'
import {GameController} from '../../game-controller'
import {LocalMessage, localMessages} from '../../messages'

export default function* virtualPlayerActionSaga(
	con: GameController,
	component: AIComponent,
) {
	const coinFlips = con.game.currentPlayer.coinFlips
	yield* delay(con.getRandomDelayForAI(coinFlips))
	const action = component.getNextTurnAction()
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		action: action,
		playerEntity: component.playerEntity,
	})
}
