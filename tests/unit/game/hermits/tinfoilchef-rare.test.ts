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
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					// Draw One Card
					await test.playCardFromHand(TinFoilChefRare, 'hermit', 0)
					// Draw one card (Deck size goes to 9)
					yield* endTurn(game)

					yield* endTurn(game)

					await test.attack('secondary')
					// Draw two cards (Deck size goes to 7).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(7)

					yield* endTurn(game)
					// Draw one card(Deck size goes to 6).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(6)
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
				saga: async (test, game) => {
					await test.playCardFromHand(OriginalXBRare, 'hermit', 0)
					yield* endTurn(game)

					// Draw One Card
					await test.playCardFromHand(TinFoilChefRare, 'hermit', 0)
					// Draw one card (Deck size goes to 9)
					yield* endTurn(game)

					await test.attack('secondary')

					yield* endTurn(game)

					await test.attack('secondary')
					expect(game.currentPlayer.getDrawPile()?.length).toBe(9)
					// Draw three cards (Deck size goes to 6).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(6)

					yield* endTurn(game)
					// Draw one card(Deck size goes to 5).
					yield* endTurn(game)

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(5)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
