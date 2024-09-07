import {describe, expect, test} from '@jest/globals'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import PearlescentMoonRare from 'common/cards/default/hermits/pearlescentmoon-rare'
import SkizzlemanRare from 'common/cards/season-x/hermits/skizzleman-rare'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {
	AussiePingEffect,
	AussiePingImmuneEffect,
} from 'common/status-effects/aussie-ping'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Skizzleman Rare Rare', () => {
	test('Gaslight works as intended', () => {
		testGame(
			{
				playerOneDeck: [SkizzlemanRare, Anvil],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							SkizzlemanRare.secondary.damage -
							20 /* Gaslight */ -
							30 /* Anvil damage */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							SkizzlemanRare.secondary.damage -
							20 /* Gaslight */ -
							10 /* Anvil damage */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
