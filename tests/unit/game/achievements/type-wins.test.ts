import {describe, expect, test} from '@jest/globals'
import {BalancedWins} from 'common/achievements/type-wins'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {testAchivement} from '../utils'

describe('Test type win achivements', () => {
	test('Test win counts when you 7 hermits of type', async () => {
		await testAchivement(
			{
				achievement: BalancedWins,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
				],

				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(
						BalancedWins.getProgress(achievement.goals),
					).toBeGreaterThanOrEqual(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Test win does not count when you 7 hermits of type but do not win', async () => {
		await testAchivement(
			{
				achievement: BalancedWins,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
				],

				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(BalancedWins.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Test win does not count when you have less than 7 hermits', async () => {
		await testAchivement(
			{
				achievement: BalancedWins,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(BalancedWins.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
