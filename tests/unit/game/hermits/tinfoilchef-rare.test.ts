import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import OriginalXBRare from 'common/cards/hermits/originalxb-rare'
import TinFoilChefRare from 'common/cards/hermits/tinfoilchef-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test TFC Rare', () => {
	test('TFC draws exactly one card.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [TinFoilChefRare, ...new Array(16).fill(BalancedItem)],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					// Draw One Card
					yield* playCardFromHand(game, TinFoilChefRare, 'hermit', 0)
					// Draw one card (Deck size goes to 9)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					// Draw two cards (Deck size goes to 7).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDeck()?.length).toBe(7)

					yield* endTurn(game)
					// Draw one card(Deck size goes to 6).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDeck()?.length).toBe(6)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('TFC + Original XB draws two additional cards at end of turn', () => {
		testGame(
			{
				playerOneDeck: [OriginalXBRare],
				playerTwoDeck: [TinFoilChefRare, ...new Array(16).fill(BalancedItem)],
				saga: function* (game) {
					yield* playCardFromHand(game, OriginalXBRare, 'hermit', 0)
					yield* endTurn(game)

					// Draw One Card
					yield* playCardFromHand(game, TinFoilChefRare, 'hermit', 0)
					// Draw one card (Deck size goes to 9)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.currentPlayer.getDeck()?.length).toBe(9)
					// Draw three cards (Deck size goes to 6).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDeck()?.length).toBe(6)

					yield* endTurn(game)
					// Draw one card(Deck size goes to 5).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDeck()?.length).toBe(5)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
