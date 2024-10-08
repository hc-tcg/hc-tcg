import {describe, expect, test} from '@jest/globals'
import IronArmor from 'common/cards/attach/iron-armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SmallishbeansCommon from 'common/cards/hermits/smallishbeans-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Ladder from 'common/cards/single-use/ladder'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Ladder', () => {
	test('Basic Functionality', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					SmallishbeansCommon,
					BalancedItem,
					IronArmor,
					Ladder,
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, SmallishbeansCommon, 'hermit', 1)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* playCardFromHand(game, IronArmor, 'attach', 0)
					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.hermit,
								query.slot.rowIndex(0),
							)
							?.getCard()?.props,
					).toBe(SmallishbeansCommon)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.primary.damage)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.item,
								query.slot.index(0),
								query.slot.rowIndex(0),
							)
							?.getCard(),
					).not.toBe(null)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.attach,
								query.slot.rowIndex(0),
							)
							?.getCard(),
					).not.toBe(null)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.hermit,
								query.slot.rowIndex(1),
							)
							?.getCard()?.props,
					).toBe(EthosLabCommon)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(SmallishbeansCommon.health)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.item,
								query.slot.index(0),
								query.slot.rowIndex(1),
							)
							?.getCard(),
					).toBe(null)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.attach,
								query.slot.rowIndex(1),
							)
							?.getCard(),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
