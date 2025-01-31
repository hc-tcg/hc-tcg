import {AIComponent} from 'common/components/ai-component'
import {
	PlaintextNode,
	concatFormattedTextNodes,
	formatNodefromShorthand,
	formatText,
} from 'common/utils/formatting'
import {delay, put} from 'typed-redux-saga'
import {GameController} from '../../game-controller'
import {LocalMessage, localMessages} from '../../messages'

export default function* virtualPlayerActionSaga(
	con: GameController,
	component: AIComponent,
) {
	const coinFlips = con.game.currentPlayer.coinFlips
	yield* delay(con.getRandomDelayForAI(coinFlips))
	try {
		const action = component.getNextTurnAction()
		yield* put<LocalMessage>({
			type: localMessages.GAME_TURN_ACTION,
			action: action,
			playerEntity: component.playerEntity,
		})
	} catch (e) {
		con.chat.push({
			createdAt: Date.now(),
			message: concatFormattedTextNodes(
				formatText(`$oAI$: "${component.ai.id}" `),
				formatNodefromShorthand('b', PlaintextNode(`${e}`)),
			),
			sender: {
				type: 'system',
				id: component.playerEntity,
			},
		})
		con.chatUpdate()
	}
}
