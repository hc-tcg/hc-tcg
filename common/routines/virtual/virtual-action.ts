import {delay, put} from 'typed-redux-saga'
import {AIComponent} from '../../components/ai-component'
import {GameModel} from '../../models/game-model'
import {clientMessages} from '../../socket-messages/client-messages'
import {serverMessages} from '../../socket-messages/server-messages'
import {
	PlaintextNode,
	concatFormattedTextNodes,
	formatNodefromShorthand,
	formatText,
} from '../../utils/formatting'

function getRandomDelay() {
	return Math.random() * 500 + 500
}

export default function* virtualPlayerActionSaga(
	game: GameModel,
	component: AIComponent,
) {
	// @todo THIS IS SCREWING THINGS UP PROBABLY
	return

	const coinFlips = game.currentPlayer.coinFlips
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
		game.chat.push({
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
		broadcast(game.getPlayers(), {
			type: serverMessages.CHAT_UPDATE,
			messages: game.chat,
		})
	}
}
