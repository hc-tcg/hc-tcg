import {describe, expect, test} from '@jest/globals'
import {IronArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FalseSymmetryRare from 'common/cards/hermits/falsesymmetry-rare'
import GrianCommon from 'common/cards/hermits/grian-common'
import SmallishbeansCommon from 'common/cards/hermits/smallishbeans-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Ladder from 'common/cards/single-use/ladder'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Ladder', () => {
	test('Basic Functionality', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					SmallishbeansCommon,
					BalancedItem,
					IronArmor,
					Ladder,
				],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(SmallishbeansCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('primary')
					await test.endTurn()

					await test.playCardFromHand(IronArmor, 'attach', 0)
					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.hermit,
							query.slot.rowIndex(0),
						)?.card?.props,
					).toBe(SmallishbeansCommon)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.primary.damage)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.item,
							query.slot.index(0),
							query.slot.rowIndex(0),
						)?.card,
					).not.toBe(null)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.attach,
							query.slot.rowIndex(0),
						)?.card,
					).not.toBe(null)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.hermit,
							query.slot.rowIndex(1),
						)?.card?.props,
					).toBe(EthosLabCommon)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(SmallishbeansCommon.health)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.item,
							query.slot.index(0),
							query.slot.rowIndex(1),
						)?.card,
					).toBe(null)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.attach,
							query.slot.rowIndex(1),
						)?.card,
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Ladder allows row to have more health than hermit max', async () => {
		// Test is dependent on these inequalities
		expect(FalseSymmetryRare.health).toBeLessThan(GrianCommon.health)
		expect(EthosLabCommon.primary.damage).toBeLessThan(
			GrianCommon.health - FalseSymmetryRare.health,
		)

		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [FalseSymmetryRare, GrianCommon, Ladder],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(FalseSymmetryRare, 'hermit', 1)
					await test.playCardFromHand(GrianCommon, 'hermit', 0)
					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(game.currentPlayer.activeRow?.health).toBe(GrianCommon.health)
					await test.attack('secondary')
					expect(game.currentPlayer.activeRow?.health).toBe(GrianCommon.health)
					await test.endTurn()

					await test.attack('primary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianCommon.health - EthosLabCommon.primary.damage,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
