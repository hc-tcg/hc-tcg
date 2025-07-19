import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import SmallishbeansRare from 'common/cards/hermits/smallishbeans-rare'
import {testGame} from '../utils'

describe('Test Smallishbeans Rare', () => {
	test('Test "Obsess"', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [SmallishbeansRare, EthosLabCommon, GeminiTayRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SmallishbeansRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 2)
					await test.attack('secondary')

					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							(SmallishbeansRare.secondary.damage +
								20) /* Obsess is triggered by 2 hermits */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
