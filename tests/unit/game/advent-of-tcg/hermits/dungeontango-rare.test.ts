import {describe, expect, test} from '@jest/globals'
import DungeonTangoRare from 'common/cards/advent-of-tcg/hermits/dungeontango-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import MinerItem from 'common/cards/items/miner-common'
import Crossbow from 'common/cards/single-use/crossbow'
import Efficiency from 'common/cards/single-use/efficiency'
import {CardComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../../utils'

// Circular imports must be included last
import Piston from 'common/cards/single-use/piston'

describe('Test DM Tango Lackey', () => {
	test('Lackey functionality', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				DungeonTangoRare,
				...Array(10).fill(MinerItem),
				EthosLabCommon,
				DungeonTangoRare,
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(DungeonTangoRare, 'hermit', 0)
				await test.playCardFromHand(MinerItem, 'item', 0, 0)
				await test.attack('primary')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				expect(
					game.currentPlayer.getDiscarded().map((card) => card.props),
				).toStrictEqual([MinerItem])
				expect(
					game.currentPlayer.getHand().sort(CardComponent.compareOrder).at(-1)
						?.props,
				).toStrictEqual(EthosLabCommon)
			},
		})
	})

	test('Canceling Lackey attack and using Efficiency', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				DungeonTangoRare,
				EthosLabCommon,
				Crossbow,
				Piston,
				Efficiency,
				...Array(5).fill(MinerItem),
				EthosLabCommon,
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(DungeonTangoRare, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(MinerItem, 'item', 0, 0)
				await test.playCardFromHand(Crossbow, 'single_use')
				await test.attack('primary')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				await test.removeEffect()
				await test.playCardFromHand(Piston, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				await test.pick(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(1),
					query.slot.index(0),
				)
				await test.playCardFromHand(Efficiency, 'single_use')
				await test.applyEffect()
				await test.attack('primary')
				expect(game.state.pickRequests).toHaveLength(0)
				expect(
					game.components.find(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)?.card?.props,
				).toStrictEqual(MinerItem)
			},
		})
	})

	test('Failing to find a Hermit card', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [DungeonTangoRare, ...Array(10).fill(MinerItem)],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(DungeonTangoRare, 'hermit', 0)
				await test.playCardFromHand(MinerItem, 'item', 0, 0)
				await test.attack('primary')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				expect(
					game.components.find(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)?.card?.props,
				).toStrictEqual(MinerItem)
			},
		})
	})
})
