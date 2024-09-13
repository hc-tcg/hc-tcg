import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/alter-egos/effects/armor-stand'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Armor Stand', () => {
	test("Armor stand doesn't give a prize card", () => {
		testGame(
			{
				playerOneDeck: [ArmorStand, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(game.currentPlayer.lives).toBe(3)
					expect(game.currentPlayer.activeRow).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
