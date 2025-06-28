import {describe, expect, test} from '@jest/globals'
import Win from 'common/achievements/wins'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test win achivement', () => {
	test('Test win achivement', () => {
		testAchivement(
			{
				achievement: Win,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					await test.attack('secondary')
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
	test('Test win achivement does not count wrong player wins', () => {
		testAchivement(
			{
				achievement: Win,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Win.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Test forfeit wins count', () => {
		testAchivement(
			{
				achievement: Win,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Win.getProgress(achievement.goals)).toBe(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
