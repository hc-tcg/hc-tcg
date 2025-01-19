import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import KingJoelRare from 'common/cards/hermits/kingjoel-rare'
import WelsknightCommon from 'common/cards/hermits/welsknight-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Egg from 'common/cards/single-use/egg'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test rare King Joel Steal', () => {
	test('Test regular Steal behavior', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, BalancedItem],
				playerTwoDeck: [KingJoelRare, WelsknightCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)
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
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, BalancedItem],
				playerTwoDeck: [KingJoelRare, WelsknightCommon, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)
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
					).toBe(FarmerBeefCommon.health - 10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
