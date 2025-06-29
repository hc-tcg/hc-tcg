import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import CommandBlock from 'common/cards/attach/command-block'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import Clock from 'common/cards/single-use/clock'
import Crossbow from 'common/cards/single-use/crossbow'
import Efficiency from 'common/cards/single-use/efficiency'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Human Cleo Betrayal', () => {
	test('Test Betrayal with canceling to Ender Pearl knock-out', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					VintageBeefCommon,
					Crossbow,
					EnderPearl,
				],
				playerTwoDeck: [HumanCleoRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10 // Prepare active row to be knocked-out after using Ender Pearl
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.removeEffect()

					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					await test.changeActiveHermit(1)
					await test.attack('secondary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						VintageBeefCommon.health,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health - VintageBeefCommon.secondary.damage,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Betrayal knocking-out opponent active hermit', async () => {
		await testGame(
			{
				playerOneDeck: [ArmorStand, EthosLabCommon, VintageBeefCommon],
				playerTwoDeck: [HumanCleoRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(VintageBeefCommon.health - EthosLabCommon.primary.damage)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Betrayal + Clock', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HumanCleoRare, Clock],
				testGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(Clock, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Betrayal works when opponent has Command Block', async () => {
		await testGame(
			{
				playerOneDeck: [
					HumanCleoRare,
					EthosLabCommon,
					CommandBlock,
					BalancedDoubleItem,
				],
				playerTwoDeck: [HumanCleoRare, CommandBlock, BalancedDoubleItem],
				testGame: async (test, game) => {
					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(CommandBlock, 'attach', 0)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.playCardFromHand(CommandBlock, 'attach', 0)
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.endTurn()
				},
			},
			{noItemRequirements: false, forceCoinFlip: true},
		)
	})

	test('Test Betrayal works when opponent uses Efficiency', async () => {
		await testGame(
			{
				playerOneDeck: [HumanCleoRare, EthosLabCommon, Efficiency],
				playerTwoDeck: [HumanCleoRare, Efficiency],
				testGame: async (test, game) => {
					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(Efficiency, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.playCardFromHand(Efficiency, 'single_use')
					await test.applyEffect()
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.endTurn()
				},
			},
			{noItemRequirements: false, forceCoinFlip: true},
		)
	})

	test('Test Betrayed allows ending turn when opponent switches from row with no items', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, BalancedDoubleItem],
				playerTwoDeck: [HumanCleoRare, Efficiency],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 1, 0)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(Efficiency, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.endTurn()
				},
			},
			{noItemRequirements: false, forceCoinFlip: true},
		)
	})
})
