import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import OriginalXBRare from 'common/cards/hermits/originalxb-rare'
import TinFoilChefRare from 'common/cards/hermits/tinfoilchef-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import {testGame} from '../utils'

describe('Test TFC Rare', () => {
	test('TFC draws exactly one card.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [TinFoilChefRare, ...new Array(16).fill(BalancedItem)],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					// Draw One Card
					await test.playCardFromHand(TinFoilChefRare, 'hermit', 0)
					// Draw one card (Deck size goes to 9)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					// Draw two cards (Deck size goes to 7).
					await test.endTurn()

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(7)

					await test.endTurn()
					// Draw one card(Deck size goes to 6).
					await test.endTurn()

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(6)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('TFC + Original XB draws two additional cards at end of turn', async () => {
		await testGame(
			{
				playerOneDeck: [OriginalXBRare],
				playerTwoDeck: [TinFoilChefRare, ...new Array(16).fill(BalancedItem)],
				testGame: async (test, game) => {
					await test.playCardFromHand(OriginalXBRare, 'hermit', 0)
					await test.endTurn()

					// Draw One Card
					await test.playCardFromHand(TinFoilChefRare, 'hermit', 0)
					// Draw one card (Deck size goes to 9)
					await test.endTurn()

					await test.attack('secondary')

					await test.endTurn()

					await test.attack('secondary')
					expect(game.currentPlayer.getDrawPile()?.length).toBe(9)
					// Draw three cards (Deck size goes to 6).
					await test.endTurn()

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(6)

					await test.endTurn()
					// Draw one card(Deck size goes to 5).
					await test.endTurn()

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(5)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
