import {PlayerEntity} from 'common/entities'
import {GameModel} from 'common/models/game-model'
import {TurnAction} from 'common/types/game-state'
import {
	PlaintextNode,
	concatFormattedTextNodes,
	formatNodefromShorthand,
	formatText,
} from 'common/utils/formatting'
import {delay, put} from 'typed-redux-saga'
import {broadcast} from '../../utils/comm'
import {AIComponent} from './ai-component'

function getRandomDelay() {
	return Math.random() * 500 + 500
}

export type VirtualAIReturn = {
	type: TurnAction
	payload?: any
	playerEntity: PlayerEntity
}
export interface VirtualAI {
	get id(): string

	getTurnAction(
		game: GameModel,
		component: AIComponent,
	): Generator<any, VirtualAIReturn>
}
export type AIClass = new () => VirtualAI

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
