import {describe, expect, test} from '@jest/globals'
import MiningFatigue from 'common/cards/advent-of-tcg/single-use/mining-fatigue'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import Efficiency from 'common/cards/single-use/efficiency'
import {applyEffect, endTurn, playCardFromHand, testGame} from '../../utils'

describe('Test Mining Fatigue', () => {
	test('Mining Fatigue functionality', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					BalancedItem,
					BalancedDoubleItem,
					BalancedItem,
				],
				playerTwoDeck: [EthosLabCommon, MiningFatigue],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, MiningFatigue, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'PRIMARY_ATTACK',
					)
					yield* playCardFromHand(game, BalancedDoubleItem, 'item', 0, 1)
					expect(game.state.turn.availableActions).toContain('PRIMARY_ATTACK')
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 2)
					expect(game.state.turn.availableActions).toContain('SECONDARY_ATTACK')
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: false},
		)
	})

	test('Efficiency works against Mining Fatigue', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Efficiency],
				playerTwoDeck: [EthosLabCommon, MiningFatigue],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, MiningFatigue, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'PRIMARY_ATTACK',
					)
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					yield* playCardFromHand(game, Efficiency, 'single_use')
					yield* applyEffect(game)
					expect(game.state.turn.availableActions).toContain('PRIMARY_ATTACK')
					expect(game.state.turn.availableActions).toContain('SECONDARY_ATTACK')
				},
			},
			{startWithAllCards: true, noItemRequirements: false},
		)
	})
})
