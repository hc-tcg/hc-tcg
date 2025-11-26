import {describe, expect, test} from '@jest/globals'
import UseLikeAHermit from 'common/achievements/use-like-a-hermit'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {testAchivement} from '../utils'

describe('Test Use Like a Hermit achievement', () => {
	test('Positive Case', async () => {
		await testAchivement(
			{
				achievement: UseLikeAHermit,
				playerOneDeck: [ArmorStand],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(UseLikeAHermit.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Negative Case', async () => {
		await testAchivement(
			{
				achievement: UseLikeAHermit,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ArmorStand],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(ArmorStand, 'hermit', 0)

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(UseLikeAHermit.getProgress(achievement.goals)).toEqual(
						undefined,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
