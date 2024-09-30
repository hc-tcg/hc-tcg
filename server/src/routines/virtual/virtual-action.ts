import {AIComponent} from 'common/components/ai-component'
import {GameModel} from 'common/models/game-model'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {
	PlaintextNode,
	concatFormattedTextNodes,
	formatNodefromShorthand,
	formatText,
} from 'common/utils/formatting'
import {delay, put} from 'typed-redux-saga'
import {broadcast} from '../../utils/comm'

function getRandomDelay() {
	return Math.random() * 500 + 500
}

export default function* virtualPlayerActionSaga(
	game: GameModel,
	component: AIComponent,
) {
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
