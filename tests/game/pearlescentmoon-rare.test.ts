import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {attack, endTurn, playCardFromHand, testGame} from './utils'
import PearlescentMoonRare from 'common/cards/default/hermits/pearlescentmoon-rare'
import {RowComponent, StatusEffectComponent} from 'common/components'
import {
	AussiePingEffect,
	AussiePingImmuneEffect,
} from 'common/status-effects/aussie-ping'
import query from 'common/components/query'
import SkizzlemanRare from 'common/cards/season-x/hermits/skizzleman-rare'
import Anvil from 'common/cards/alter-egos/single-use/anvil'

describe('Test Pearlescent MoonRare', () => {
	test('Aussie Ping', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [PearlescentMoonRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, PearlescentMoonRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(AussiePingEffect),
							query.effect.targetEntity(game.opponentPlayer.entity),
						),
					).not.toBe(null)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(PearlescentMoonRare.health)

					yield* endTurn(game)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(AussiePingImmuneEffect),
							query.effect.targetEntity(game.opponentPlayer.entity),
						),
					).not.toBe(null)
					yield* attack(game, 'secondary')

					// Aussie Ping should be blocked by the AussiePingImmune effect.
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(AussiePingEffect),
							query.effect.targetEntity(game.opponentPlayer.entity),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Aussie Ping blocks Skizzleman Rare extra damage.', () => {
		testGame(
			{
				playerOneDeck: [SkizzlemanRare, Anvil],
				playerTwoDeck: [PearlescentMoonRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, PearlescentMoonRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					// Give Skizzleman Rare the Aussie Ping effect.
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})