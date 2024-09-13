import {describe, expect, test} from '@jest/globals'
import {attack, endTurn, playCardFromHand, testGame} from './utils'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'

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
})
