import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {attack, endTurn, getWinner, playCardFromHand, testGame} from './utils'

describe('Test Game Win Conditions', () => {
	test('Killing all hermits results in victory.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
				},
				then: (game) => {
					expect(getWinner(game)).toBe('playerTwo')
					expect(game.endInfo.reason).toBe('hermits')
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
