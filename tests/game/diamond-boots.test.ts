import {describe, expect, test} from '@jest/globals'
import DiamondBoots from 'common/cards/alter-egos-iii/effects/diamond-boots'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import TangoTekCommon from 'common/cards/default/hermits/tangotek-common'
import Knockback from 'common/cards/default/single-use/knockback'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Diamond Boots', () => {
	test('Test Diamond Boots Prevents 10 Damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondBoots],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondBoots, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.currentPlayer,
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							10 /** Blocked by Diamond Boots */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Diamond Boots prevents knockback from Knockback book', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, TangoTekCommon, DiamondBoots],
				playerTwoDeck: [EthosLabCommon, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondBoots, 'attach', 0)
					yield* playCardFromHand(game, TangoTekCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Knockback, 'single_use')

					yield* attack(game, 'secondary')

					expect(game.hasActiveRequests()).toBe(false)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
