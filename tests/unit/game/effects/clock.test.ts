import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Clock from 'common/cards/single-use/clock'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import TurnSkippedEffect from 'common/status-effects/turn-skipped'
import UsedClockEffect from 'common/status-effects/used-clock'
import {TestGameFixture, testGame} from '../utils'

async function testClockHelperSaga(test: TestGameFixture, game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

	// Clock can not be played on turn one.
	await test.endTurn()
	await test.endTurn()

	await test.playCardFromHand(Clock, 'single_use')

	await test.applyEffect()

	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.targetEntity(game.opponentPlayer.entity),
			query.effect.is(TurnSkippedEffect),
		),
	).toBeTruthy()
	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.targetEntity(game.currentPlayer.entity),
			query.effect.is(UsedClockEffect),
		),
	).toBeTruthy()
}

describe('Test Clock', () => {
	test('Test Clock', async () => {
		await testGame(
			{
				testGame: testClockHelperSaga,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, Clock],
			},
			{startWithAllCards: true},
		)
	})
})
