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
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)
				yield* endTurn(game)
				yield* attack(game, 'secondary')
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
