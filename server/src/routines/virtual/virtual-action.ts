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
	try {
		while (true) {
			console.log('HERE1')
			const coinFlips = game.currentPlayer.coinFlips
			yield* delay(
				coinFlips.reduce((r, flip) => r + flip.delay, 0) + getRandomDelay(),
			)
			console.log('HERE3')
			const action = component.getNextTurnAction()
			console.log(action)
			console.log('HERE')
			yield* put({
				type: clientMessages.TURN_ACTION,
				payload: {action, playerEntity: component.playerEntity},
				action: action,
				playerEntity: component.playerEntity,
			})
			if (action.type === 'DELAY') {
				yield* delay(action.delay)
			}
			if (action.type === 'END_TURN') {
				break
			}
		}
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
