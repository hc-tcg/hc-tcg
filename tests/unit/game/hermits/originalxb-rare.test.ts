import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import OriginalXBRare from 'common/cards/hermits/originalxb-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import {testGame} from '../utils'

describe('Test Original Xb Rare', () => {
	test('Original Xb draws exactly one card.', async () => {
		await testGame(
			{
				playerOneDeck: [OriginalXBRare],
				playerTwoDeck: [EthosLabCommon, ...new Array(16).fill(BalancedItem)],
				testGame: async (test, game) => {
					await test.playCardFromHand(OriginalXBRare, 'hermit', 0)
					await test.endTurn()

					// Draw One Card
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					// Draw one card (Deck size goes to 9)
					await test.endTurn()

					await test.attack('secondary')

					await test.endTurn()

					// Draw two cards (Deck size goes to 7).
					await test.endTurn()

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(7)

					await test.endTurn()
					// Draw one card(Deck size goes to 6).
					await test.endTurn()

					expect(game.opponentPlayer.getDrawPile()?.length).toBe(6)
				},
			},
			{noItemRequirements: true},
		)
	})
})
