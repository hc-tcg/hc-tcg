import {describe, expect, test} from '@jest/globals'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import IronArmor from 'common/cards/default/effects/iron-armor'
import Thorns from 'common/cards/default/effects/thorns'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import SkizzlemanRare from 'common/cards/season-x/hermits/skizzleman-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

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
				playerOneDeck: [EthosLabCommon, EthosLabCommon, IronArmor],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, IronArmor, 'attach', 1)
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
})
