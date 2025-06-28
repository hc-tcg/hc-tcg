import {describe, expect, test} from '@jest/globals'
import AllCards from 'common/achievements/jack-of-all-cards'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import ShadEECommon from 'common/cards/hermits/shadee-common'
import BalancedItem from 'common/cards/items/balanced-common'
import {attack, endTurn, playCardFromHand, testAchivement} from '../utils'

describe('Test Jack of All Cards achivement', () => {
	test('Test Jack of All Cards increments progress on win for only default cards', () => {
		testAchivement(
			{
				achievement: AllCards,
				playerOneDeck: [EthosLabCommon, ShadEECommon, BalancedItem],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.playCardFromHand(ShadEECommon, 'hermit', 1)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(AllCards.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Test Jack of All Cards does not increment progress on loss', () => {
		testAchivement(
			{
				achievement: AllCards,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
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
