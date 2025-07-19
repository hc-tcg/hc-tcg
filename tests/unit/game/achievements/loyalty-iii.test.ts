import {describe, expect, test} from '@jest/globals'
import LoyaltyIII from 'common/achievements/loyalty-iii'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import Trident from 'common/cards/single-use/trident'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Loyalty III Achievement', () => {
	test('Test achievement is gained after three uses', async () => {
		await testAchivement(
			{
				achievement: LoyaltyIII,
				playerOneDeck: [EthosLabCommon, Trident],
				playerTwoDeck: [EthosLabCommon, InstantHealthII],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(InstantHealthII, 'single_use')
					await test.pick(
						query.slot.active,
						query.slot.currentPlayer,
						query.slot.hermit,
					)
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(LoyaltyIII.getProgress(achievement.goals)).toBe(3)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Test steps is one if using different tridents', async () => {
		await testAchivement(
			{
				achievement: LoyaltyIII,
				playerOneDeck: [EthosLabCommon, Trident, Trident],
				playerTwoDeck: [EthosLabCommon, BadOmen, InstantHealthII],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(InstantHealthII, 'single_use')
					await test.pick(
						query.slot.active,
						query.slot.currentPlayer,
						query.slot.hermit,
					)
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(LoyaltyIII.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Test streak is broken after waiting a turn', async () => {
		await testAchivement(
			{
				achievement: LoyaltyIII,
				playerOneDeck: [EthosLabCommon, Trident],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					await test.endTurn()
					await test.endTurn()

					// Rest for a turn
					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(LoyaltyIII.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
