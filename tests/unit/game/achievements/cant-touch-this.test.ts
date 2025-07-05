import {describe, expect, test} from '@jest/globals'
import CantTouchThis from 'common/achievements/cant-touch-this'
import {Thorns} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import ZedaphPlaysRare from 'common/cards/hermits/zedaphplays-rare'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import {testAchivement} from '../utils'

describe('Test Cant Touch This achievement', () => {
	test('"Cant Touch This" counts Anvil Drop miss as only one progress', async () => {
		await testAchivement(
			{
				achievement: CantTouchThis,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					InvisibilityPotion,
				],
				playerTwoDeck: [GoatfatherRare],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(GoatfatherRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(CantTouchThis.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('"Cant Touch This" streak progress is not broken by Thorns', async () => {
		await testAchivement(
			{
				achievement: CantTouchThis,
				playerOneDeck: [EthosLabCommon, InvisibilityPotion, InvisibilityPotion],
				playerTwoDeck: [EthosLabCommon, Thorns],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Thorns, 'attach', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(CantTouchThis.getProgress(achievement.goals)).toBe(2)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('"Cant Touch This" counts reflected damage from Sheep Stare as one progress', async () => {
		await testAchivement(
			{
				achievement: CantTouchThis,
				playerOneDeck: [ZedaphPlaysRare],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.attack('primary')
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(CantTouchThis.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
