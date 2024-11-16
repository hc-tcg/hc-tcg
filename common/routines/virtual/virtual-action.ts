import {put} from 'typed-redux-saga'
import {AIComponent} from '../../components/ai-component'
import {GameModel} from '../../models/game-model'
import {
	PlaintextNode,
	concatFormattedTextNodes,
	formatNodefromShorthand,
	formatText,
} from '../../utils/formatting'
import {GameMessage, gameMessages} from '../game'

function getRandomDelay() {
	return Math.random() * 500 + 500
}

export default function* virtualPlayerActionSaga(
	game: GameModel,
	component: AIComponent,
	delaySaga: (ms: number) => any,
) {
	const coinFlips = game.currentPlayer.coinFlips
	yield* delaySaga(
		coinFlips.reduce((r, flip) => r + flip.delay, 0) + getRandomDelay(),
	)
	try {
		const action = component.getNextTurnAction()
		yield* put<GameMessage>({
			gameId: game.id,
			type: gameMessages.TURN_ACTION,
			action: action,
			playerEntity: component.playerEntity,
			time: Date.now(),
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
	}
}
