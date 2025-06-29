import {expect, test} from '@jest/globals'
import HurtinHermits from 'common/achievements/hurtin-hermits'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {testAchivement} from '../utils'

test("Test Hurtin' Hermits achivement", async () => {
	await testAchivement(
		{
			achievement: HurtinHermits,
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [EthosLabCommon],
			playGame: async (test, _game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.attack('secondary')
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(
					HurtinHermits.getProgress(achievement.goals),
				).toBeGreaterThanOrEqual(HurtinHermits.levels[0].steps)
			},
		},
		{oneShotMode: true, noItemRequirements: true},
	)
})
