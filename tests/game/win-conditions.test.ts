import {describe, expect, test} from '@jest/globals'
import {endTurn, getWinner, playCardFromHand, testGame} from './utils'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'

describe('Test Game Win Conditions', () => {
	test('Killing all hermits results in victory.', () => {
		expect(() =>
			testGame(
				{
					playerOneDeck: [EthosLabCommon],
					playerTwoDeck: [EthosLabCommon],
					saga: function* (game) {
						yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
						yield* endTurn(game)

						yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					},
					then: (game) => {
						expect(game.endInfo.outcome).toBe('player_won')
						expect(game.endInfo.reason).toBe('hermits')
						expect(getWinner(game)).toBe('playerTwo')
					},
				},
				{oneShotMode: true},
			),
		).toThrow()
	})
})
