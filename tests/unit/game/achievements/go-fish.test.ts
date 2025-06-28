import {describe, expect, test} from '@jest/globals'
import GoFish from 'common/achievements/go-fish'
import {IronArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import FishingRod from 'common/cards/single-use/fishing-rod'
import Mending from 'common/cards/single-use/mending'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Go Fish Achievement', () => {
	test('Test achievement is gained after mending is drawn', async () => {
		await testAchivement(
			{
				achievement: GoFish,
				playerOneDeck: [
					EthosLabCommon,
					FishingRod,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FishingRod, 'single_use')
					await test.applyEffect()
					await test.endTurn()
					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(GoFish.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Test achievement works properly with Gem', async () => {
		await testAchivement(
			{
				achievement: GoFish,
				playerOneDeck: [
					GeminiTayRare,
					EthosLabCommon,
					IronArmor,
					FishingRod,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(IronArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Mending, 'single_use')

					await test.pick(
						query.slot.attach,
						query.slot.currentPlayer,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')

					await test.playCardFromHand(FishingRod, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(GoFish.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
