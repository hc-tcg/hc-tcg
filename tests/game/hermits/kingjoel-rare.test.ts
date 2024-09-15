import {describe, expect, test} from '@jest/globals'
import KingJoelRare from 'common/cards/alter-egos-iii/hermits/kingjoel-rare'
import Egg from 'common/cards/alter-egos/single-use/egg'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import WelsknightCommon from 'common/cards/default/hermits/welsknight-common'
import BalancedItem from 'common/cards/default/items/balanced-common'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test rare King Joel Steal', () => {
	test('Test regular Steal behavior', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Iskall85Common, BalancedItem],
				playerTwoDeck: [KingJoelRare, WelsknightCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Iskall85Common, 'hermit', 1)
					yield* playCardFromHand(game, BalancedItem, 'item', 1, 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, KingJoelRare, 'hermit', 0)
					yield* playCardFromHand(game, WelsknightCommon, 'hermit', 1)

					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(2)

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)

					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(BalancedItem),
							query.card.currentPlayer,
							query.card.attached,
						),
					).toBeTruthy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Steal pick request runs before Egg pick request.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Iskall85Common, BalancedItem],
				playerTwoDeck: [KingJoelRare, WelsknightCommon, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Iskall85Common, 'hermit', 1)
					yield* playCardFromHand(game, BalancedItem, 'item', 1, 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, KingJoelRare, 'hermit', 0)
					yield* playCardFromHand(game, WelsknightCommon, 'hermit', 1)
					yield* playCardFromHand(game, Egg, 'single_use')

					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(3)

					// Steal requests
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(BalancedItem),
							query.card.currentPlayer,
							query.card.attached,
						),
					).toBeTruthy()

					// Egg request
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(1)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(Iskall85Common.health - 10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
