import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testAchivement} from '../utils'
import Win from 'common/achievements/wins'

describe('Test win achivement', () => {
	test('Test win1 achivement', () => {
		testAchivement(
			{
				achievement: Win,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Win.getProgress(achievement.goals)).toBeGreaterThanOrEqual(
						Win.levels[0].steps,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Test win1 achivement does not count wrong player wins', () => {
		testAchivement(
			{
				achievement: Win,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Win.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
