import {describe, expect, test} from '@jest/globals'
import BrewingStand from 'common/cards/advent-of-tcg/attach/brewing-stand'
import Furnace from 'common/cards/advent-of-tcg/attach/furnace'
import CyberpunkImpulseRare from 'common/cards/advent-of-tcg/hermits/cyberpunkimpulse-rare'
import SmallishbeansAdventRare from 'common/cards/advent-of-tcg/hermits/smallishbeans-rare'
import String from 'common/cards/attach/string'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import HypnotizdRare from 'common/cards/hermits/hypnotizd-rare'
import FarmItem from 'common/cards/items/farm-common'
import FarmDoubleItem from 'common/cards/items/farm-rare'
import RedstoneItem from 'common/cards/items/redstone-common'
import WildItem from 'common/cards/items/wild-common'
import Efficiency from 'common/cards/single-use/efficiency'
import {SlotComponent} from 'common/components'
import query from 'common/components/query'
import {getAvailableEnergy} from 'server/routines/game'
import {testGame} from '../../utils'

describe('Test Cyberpunk Impulse', () => {
	test('Energy transferred', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					CyberpunkImpulseRare,
					WildItem,
					RedstoneItem,
				],
				playerTwoDeck: [EthosLabCommon, CyberpunkImpulseRare, FarmItem, String],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 1)
					await test.playCardFromHand(WildItem, 'item', 1, 0)
					expect(getAvailableEnergy(game)).toStrictEqual([])
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 1)
					await test.playCardFromHand(FarmItem, 'item', 1, 0)
					await test.playCardFromHand(
						String,
						'item',
						1,
						2,
						game.opponentPlayerEntity,
					)

					expect(getAvailableEnergy(game)).toStrictEqual(['any'])
					await test.endTurn()

					await test.playCardFromHand(RedstoneItem, 'item', 1, 1)
					expect(getAvailableEnergy(game)).toStrictEqual([])
					expect(game.currentPlayer.activeRow?.getItems()).toStrictEqual([])
				},
			},
			{},
		)
	})

	test('Betrayed uses the correct amount of transferred energy available', async () => {
		await testGame(
			{
				playerOneDeck: [
					CyberpunkImpulseRare,
					CyberpunkImpulseRare,
					FarmItem,
					FarmItem,
				],
				playerTwoDeck: [HumanCleoRare, Efficiency],
				testGame: async (test, game) => {
					await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 0)
					await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 1)
					await test.playCardFromHand(FarmItem, 'item', 1, 0)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(Efficiency, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.currentPlayer.getActiveHermit()?.getAttackCost('secondary'),
					).toHaveLength(2)
					expect(getAvailableEnergy(game)).toStrictEqual(['any'])
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.playCardFromHand(FarmItem, 'item', 1, 1)
					expect(game.state.turn.availableActions).toContain('SECONDARY_ATTACK')
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
				},
			},
			{forceCoinFlip: true, noItemRequirements: false},
		)
	})

	test('Hypno can discard a Farm item from Cyberpunk Impulse', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, CyberpunkImpulseRare, FarmItem],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(HypnotizdRare, 'hermit', 0)
					await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 1)
					await test.playCardFromHand(FarmItem, 'item', 1, 0)
					await test.attack('secondary')
					expect(game.state.pickRequests).toHaveLength(1)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Stratos Joel counts items attached to Cyberpunk Impulse', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					SmallishbeansAdventRare,
					CyberpunkImpulseRare,
					FarmItem,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SmallishbeansAdventRare, 'hermit', 0)
					await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 1)
					await test.playCardFromHand(FarmItem, 'item', 1, 0)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							(SmallishbeansAdventRare.secondary.damage +
								20) /** 1 "attached" item */,
					)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Brewing Stand does not include items attached to adjacent Cyberpunk Impulse', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					CyberpunkImpulseRare,
					BrewingStand,
					FarmItem,
					FarmItem,
				],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 1)
					await test.playCardFromHand(BrewingStand, 'attach', 0)
					await test.playCardFromHand(FarmItem, 'item', 1, 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(game.currentPlayer.coinFlips).toStrictEqual([])
					expect(game.state.pickRequests).toStrictEqual([])
					await test.playCardFromHand(FarmItem, 'item', 0, 0)
					await test.endTurn()

					await test.endTurn()

					expect(game.currentPlayer.coinFlips).toHaveLength(1)
					expect(
						game.components.filter(
							SlotComponent,
							game.state.pickRequests[0].canPick,
						),
					).toHaveLength(1)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - EthosLabCommon.secondary.damage,
					)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							50 /** Brewing Stand */,
					)
					expect(game.currentPlayer.activeRow?.getItems()).toHaveLength(0)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Furnace does not include items attached to adjacent Cyberpunk Impulse', async () => {
		await testGame({
			playerOneDeck: [
				EthosLabCommon,
				CyberpunkImpulseRare,
				Furnace,
				FarmItem,
				FarmItem,
			],
			playerTwoDeck: [EthosLabCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(CyberpunkImpulseRare, 'hermit', 1)
				await test.playCardFromHand(Furnace, 'attach', 0)
				await test.playCardFromHand(FarmItem, 'item', 1, 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(FarmItem, 'item', 0, 0)
				await test.endTurn()
				await test.endTurn()

				await test.endTurn()
				await test.endTurn()

				await test.endTurn()
				await test.endTurn()

				expect(
					game.components.find(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)?.card?.props,
				).toStrictEqual(FarmDoubleItem)
				expect(
					game.components.find(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)?.card?.props,
				).toStrictEqual(FarmItem)
				expect(
					game.currentPlayer.getDiscarded().map((card) => card.props),
				).toStrictEqual([Furnace])
			},
		})
	})
})
