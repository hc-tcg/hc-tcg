import {describe, expect, test} from '@jest/globals'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import GoldArmor from 'common/cards/default/effects/gold-armor'
import Thorns from 'common/cards/default/effects/thorns'
import Totem from 'common/cards/default/effects/totem'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import SkizzlemanRare from 'common/cards/season-x/hermits/skizzleman-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Skizzleman Rare', () => {
	test('Gaslight works as intended', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
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
							30 /* Anvil damage */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - 20 /* Gaslight */ - 10 /* Anvil damage */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Gaslight only triggers Thorns once', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Thorns, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(SkizzlemanRare.health - 20 /* Thorns damage */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test("Gaslight doesn't trigger if the hermit takes no damage", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, GoldArmor],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, GoldArmor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					// Use anvil to trigger attack the afk hermit for zero damage
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
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Totem keeps hermits alive when damaged by Gaslight and Burn at end of turn', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					Totem,
					Totem,
				],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, LavaBucket, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, Totem, 'attach', 0)
					yield* playCardFromHand(game, Totem, 'attach', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 1)
					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					// Manually set Etho (1) health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 20
					// Manually set Etho (3) health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(2),
					)!.health = 30

					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(10) // Check Burn -> Gas Light
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(10) // Check Anvil -> Gas Light + Burn
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
