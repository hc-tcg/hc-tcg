import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from './utils'

describe('Test prize card.', () => {
	test('Test prize card is gained after knockout', async () => {
		await testGame(
			{
				playerOneDeck: [
					/** Hand is seven cards */
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					/* Drawn at the end of the turn */
					EthosLabCommon,
					/* This will become the prize card */
					EthosLabCommon,
				],
				playerTwoDeck: [GeminiTayCommon],
				testGame: async (test, game) => {
					/** Make sure `prizeCard` does not start out as true */
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hand),
							query.card.prizeCard,
						),
					).toBeFalsy()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					/** Play two hermits to prevent the game from finishing before the tests finish */
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hand),
							query.card.prizeCard,
						),
					).toBeTruthy()
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
