import {describe, expect, test} from '@jest/globals'
import {attack, endTurn, playCardFromHand, testGame} from './utils'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import OriginalXBRare from 'common/cards/alter-egos-iii/hermits/originalxb-rare'
import BalancedItem from 'common/cards/default/items/balanced-common'

describe('Test Original Xb Rare', () => {
	test('Original Xb draws exactly one card.', () => {
		testGame(
			{
				playerOneDeck: [OriginalXBRare],
				playerTwoDeck: [
					EthosLabCommon,
					...new Array(20).fill(BalancedItem),
				],
				saga: function* (game) {
					yield* playCardFromHand(game, OriginalXBRare, 'hermit', 0)
					yield* endTurn(game)

          // Draw One Card
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.getDeck()?.length).toBe(4)
				},
			},
			{noItemRequirements: true},
		)
	})
})
