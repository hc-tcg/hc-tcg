import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import SmallishbeansRare from 'common/cards/hermits/smallishbeans-rare'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test Smallishbeans Rare', () => {
	test('Test "Obsess"', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [SmallishbeansRare, EthosLabCommon, GeminiTayRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 2)
					yield* attack(game, 'secondary')

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
