import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import NetheriteSword from 'common/cards/default/single-use/netherite-sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../../utils'

// Circular imports must be included last
import Trapdoor from 'common/cards/advent-of-tcg/effects/trapdoor'

describe('Test Trapdoor', () => {
	test('Trapdoor functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Trapdoor],
				playerTwoDeck: [Iskall85Common, NetheriteSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - (Iskall85Common.secondary.damage - 40))
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, NetheriteSword, 'single_use')
					yield* attack(game, 'single-use')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(Iskall85Common.secondary.damage - 40) -
							(60 - 40) /** Netherite Sword */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 80)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
