import {GameModel} from 'common/models/game-model'
import {delay, put} from 'typed-redux-saga'
import {TurnAction} from 'common/types/game-state'
import {broadcast} from '../../utils/comm'

function getRandomDelay() {
	return Math.random() * 500 + 500
}

export type VirtualAIReturn = {type: TurnAction; payload?: any; playerId: string}
export interface VirtualAI {
	get id(): string

	getTurnAction(game: GameModel): Generator<any, VirtualAIReturn>
}

export default function* virtualPlayerActionSaga(game: GameModel, ai: VirtualAI) {
	const coinFlips = game.currentPlayer.coinFlips
	yield* delay(coinFlips.length * 2600 + getRandomDelay())
	try {
		const action = yield* ai.getTurnAction(game)
		yield* put(action)
	} catch (e) {
		const errorLog = `"${ai.id}" ${e} `
		game.chat.push({
			createdAt: Date.now(),
			message: [
				{text: 'AI ', format: 'highlight', censoredText: 'AI '},
				{text: errorLog, format: 'plain', censoredText: errorLog},
			],
			playerId: game.currentPlayerId,
			systemMessage: true,
		})
		broadcast(game.getPlayers(), 'CHAT_UPDATE', game.chat)
	}
}
