import {AIComponent} from 'common/components/ai-component'
import {GameModel} from 'common/models/game-model'
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
		const payload = yield* component.getTurnAction()
		yield* put({
			type: 'TURN_ACTION',
			payload,
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
		broadcast(game.getPlayers(), 'CHAT_UPDATE', game.chat)
	}
}
