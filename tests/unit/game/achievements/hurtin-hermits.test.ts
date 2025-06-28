import {expect, test} from '@jest/globals'
import HurtinHermits from 'common/achievements/hurtin-hermits'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testAchivement} from '../utils'

test("Test Hurtin' Hermits achivement", () => {
	testAchivement(
		{
			achievement: HurtinHermits,
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [EthosLabCommon],
			playGame: function* (game) {
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
