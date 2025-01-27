import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test prize card.', () => {
	test('Test prize card is gained after knockout', () => {
		testGame(
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
				saga: function* (game) {
					/** Make sure `prizeCard` does not start out as true */
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hand),
							query.card.prizeCard,
						),
					).toBeFalsy()

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					/** Play two hermits to prevent the game from finishing before the tests finish */
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

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
