import {describe, expect, test} from '@jest/globals'
import {Win1} from 'common/achievements/wins'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testAchivement} from '../utils'

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
					yield* endTurn(game)
					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Win1.getProgress(achievement.goals)).toBeGreaterThanOrEqual(
						Win1.steps,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Test win1 achivement does not count wrong player wins', () => {
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
					expect(Win1.getProgress(achievement.goals)).toBeLessThan(Win1.steps)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
