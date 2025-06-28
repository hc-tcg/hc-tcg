import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import KingJoelRare from 'common/cards/hermits/kingjoel-rare'
import WelsknightCommon from 'common/cards/hermits/welsknight-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Egg from 'common/cards/single-use/egg'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test rare King Joel Steal', () => {
	test('Test regular Steal behavior', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, BalancedItem],
				playerTwoDeck: [KingJoelRare, WelsknightCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedItem, 'item', 1, 0)

					await test.endTurn()

					await test.playCardFromHand(KingJoelRare, 'hermit', 0)
					await test.playCardFromHand(WelsknightCommon, 'hermit', 1)

					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(2)

					await test.pick(
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)

					await test.pick(
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

	test('Test Steal pick request runs before Egg pick request.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, BalancedItem],
				playerTwoDeck: [KingJoelRare, WelsknightCommon, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedItem, 'item', 1, 0)

					await test.endTurn()

					await test.playCardFromHand(KingJoelRare, 'hermit', 0)
					await test.playCardFromHand(WelsknightCommon, 'hermit', 1)
					await test.playCardFromHand(Egg, 'single_use')

					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(3)

					// Steal requests
					await test.pick(
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)
					await test.pick(
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
					await test.pick(
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
