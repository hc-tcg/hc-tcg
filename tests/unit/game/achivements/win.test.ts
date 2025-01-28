import {describe, expect, test} from '@jest/globals'
import {attack, endTurn, playCardFromHand, testAchivement} from '../utils'
import {Win1} from 'common/achievements/wins'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'

describe('Test win achivement', () => {
	test('Test win1 achivement', () => {
		testAchivement(
			{
				achievement: Win1,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Win1.getProgress(achievement.goals)).toBeGreaterThanOrEqual(Win1.steps)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
