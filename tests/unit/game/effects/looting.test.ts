import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Looting from 'common/cards/single-use/looting'
import {applyEffect, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test Looting.', () => {
	test('Test looting works as expected', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, BalancedItem],
				playerTwoDeck: [EthosLabCommon, Looting],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Looting, 'single_use')
					yield* applyEffect(game)

					expect(
						game.getPickableSlots(game.state.pickRequests[0].canPick).length,
					).toBeGreaterThanOrEqual(1)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
