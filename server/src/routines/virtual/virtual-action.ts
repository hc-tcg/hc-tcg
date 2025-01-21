import {AIComponent} from 'common/components/ai-component'
import {GameModel} from 'common/models/game-model'
import {clientMessages} from 'common/socket-messages/client-messages'
import {
	PlaintextNode,
	concatFormattedTextNodes,
	formatNodefromShorthand,
	formatText,
} from 'common/utils/formatting'
import {delay, put} from 'typed-redux-saga'
import {GameController} from '../../game-controller'

function getRandomDelay(game: GameModel) {
	return game.rng() * 500 + 500
}

export default function* virtualPlayerActionSaga(
	con: GameController,
	component: AIComponent,
) {
	const coinFlips = con.game.currentPlayer.coinFlips
	yield* delay(
		coinFlips.reduce((r, flip) => r + flip.delay, 0) + getRandomDelay(con.game),
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
