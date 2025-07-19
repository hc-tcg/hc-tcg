import {describe, expect, test} from '@jest/globals'
import AllCards from 'common/achievements/jack-of-all-cards'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import ShadEECommon from 'common/cards/hermits/shadee-common'
import BalancedItem from 'common/cards/items/balanced-common'
import {testAchivement} from '../utils'

describe('Test Jack of All Cards achivement', () => {
	test('Test Jack of All Cards increments progress on win for only default cards', async () => {
		await testAchivement(
			{
				achievement: AllCards,
				playerOneDeck: [EthosLabCommon, ShadEECommon, BalancedItem],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.playCardFromHand(ShadEECommon, 'hermit', 1)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(AllCards.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Test Jack of All Cards does not increment progress on loss', async () => {
		await testAchivement(
			{
				achievement: AllCards,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(AllCards.getProgress(achievement.goals)).toEqual(0)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
