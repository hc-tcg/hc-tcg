import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'
import BalancedItem from 'common/cards/items/balanced-common'
import Looting from 'common/cards/single-use/looting'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'

describe('Test Looting.', () => {
	test('Test looting does not brick game after knocking out opponent', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, GeminiTayCommon, BalancedItem],
				playerTwoDeck: [EthosLabCommon, Looting],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Looting, 'single_use')
					yield* attack(game, 'secondary')

					expect(
						game.getPickableSlots(Looting.attachCondition).length,
					).toBeGreaterThanOrEqual(1)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
