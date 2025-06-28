import {describe, expect, test} from '@jest/globals'
import HermitsAndCrafting from 'common/achievements/hermits-and-crafting'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SmallishbeansCommon from 'common/cards/hermits/smallishbeans-common'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import {testAchivement} from '../utils'

describe('Test Hermits and Crafting achievement', () => {
	test('Test "Hermits and Crafting" does not progress after winning with a Starter Deck', async () => {
		await testAchivement(
			{
				achievement: HermitsAndCrafting,
				playerOneDeck: STARTER_DECKS[1].cards,
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(SmallishbeansCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(HermitsAndCrafting.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, oneShotMode: true},
		)
	})

	test('Test "Hermits and Crafting" progresses after winning with a deck that is not a starter deck', async () => {
		await testAchivement(
			{
				achievement: HermitsAndCrafting,
				playerOneDeck: [SmallishbeansCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(SmallishbeansCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(HermitsAndCrafting.getProgress(achievement.goals)).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, oneShotMode: true},
		)
	})
})
