import {describe, expect, test} from '@jest/globals'
import Win from 'common/achievements/wins'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
	testGame,
} from './utils'

describe('Test Game Utils', () => {
	test('Test fails if game ends', () => {
		expect(() =>
			testGame(
				{
					playerOneDeck: [EthosLabCommon],
					playerTwoDeck: [EthosLabCommon],
					saga: function* (game) {
						yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
						yield* endTurn(game)

						yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
						yield* attack(game, 'secondary')
						// The game should never reach this point
						yield* endTurn(game)
					},
				},
				{oneShotMode: true},
			),
		).toThrow()
	})
	test('Test achievment tests run', () => {
		let playedGame = false
		let checkedAchievment = false
		testAchivement(
			{
				achievement: Win,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					playedGame = true
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, _achievement, _outcome) {
					checkedAchievment = true
				},
			},
			{oneShotMode: true},
		)
		expect(playedGame).toBeTruthy()
		expect(checkedAchievment).toBeTruthy()
	})
})
