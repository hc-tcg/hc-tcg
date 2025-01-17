import {AIComponent} from 'common/components/ai-component'
import {clientMessages} from 'common/socket-messages/client-messages'
import {
	PlaintextNode,
	concatFormattedTextNodes,
	formatNodefromShorthand,
	formatText,
} from 'common/utils/formatting'
import {GameController} from 'game-controller'
import {delay, put} from 'typed-redux-saga'

function getRandomDelay() {
	return Math.random() * 500 + 500
}

export default function* virtualPlayerActionSaga(
	con: GameController,
	component: AIComponent,
) {
	const coinFlips = con.game.currentPlayer.coinFlips
	yield* delay(
		coinFlips.reduce((r, flip) => r + flip.delay, 0) + getRandomDelay(),
	)
	try {
		const action = component.getNextTurnAction()
		yield* put({
			type: clientMessages.TURN_ACTION,
			payload: {action, playerEntity: component.playerEntity},
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
