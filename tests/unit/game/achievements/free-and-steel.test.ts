import {describe, expect, test} from '@jest/globals'
import FreeAndSteel from 'common/achievements/free-and-steel'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import FlintAndSteel from 'common/cards/single-use/flint-and-steel'
import {testAchivement} from '../utils'

describe('Test Free & Steel Achievement', () => {
	test('Test achievement is when hand only contains flint and steel', async () => {
		await testAchivement(
			{
				achievement: FreeAndSteel,
				playerOneDeck: [
					EthosLabCommon,
					FlintAndSteel,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 4)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.playCardFromHand(FlintAndSteel, 'single_use')
					await test.applyEffect()
					await test.endTurn()
					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(FreeAndSteel.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Negative test', async () => {
		await testAchivement(
			{
				achievement: FreeAndSteel,
				playerOneDeck: [
					EthosLabCommon,
					FlintAndSteel,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FlintAndSteel, 'single_use')
					await test.applyEffect()
					await test.endTurn()
					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(FreeAndSteel.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
