import assert from 'assert'
import {describe, expect, test} from '@jest/globals'
import Furnace from 'common/cards/advent-of-tcg/attach/furnace'
import WildDoubleItem from 'common/cards/advent-of-tcg/items/wild-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import RedstoneItem from 'common/cards/items/redstone-common'
import RedstoneDoubleItem from 'common/cards/items/redstone-rare'
import WildItem from 'common/cards/items/wild-common'
import Emerald from 'common/cards/single-use/emerald'
import Ladder from 'common/cards/single-use/ladder'
import Mending from 'common/cards/single-use/mending'
import {CardComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import SmeltingEffect from 'common/status-effects/smelting'
import {testGame} from '../../utils'

function sortRowItems(a: CardComponent, b: CardComponent): number {
	assert(a.slot.inRow() && a.slot.index !== null)
	assert(b.slot.inRow() && b.slot.index !== null)
	return a.slot.index - b.slot.index
}

describe('Test Furnace Attach Effect', () => {
	test('Basic functionality', async () => {
		await testGame({
			playerOneDeck: [
				EthosLabCommon,
				Furnace,
				BalancedItem,
				WildItem,
				RedstoneItem,
			],
			playerTwoDeck: [EthosLabCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				await test.playCardFromHand(Furnace, 'attach', 0)
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(4)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(WildItem, 'item', 0, 1)
				await test.endTurn()

				await test.endTurn()

				await test.playCardFromHand(RedstoneItem, 'item', 0, 2)
				await test.endTurn()

				await test.endTurn()

				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(1)
				expect(
					game.components.find(
						CardComponent,
						query.card.is(Furnace),
						query.card.currentPlayer,
					)?.slot.type,
				).toBe('attach')
				expect(
					game.currentPlayer.activeRow
						?.getItems()
						.sort(sortRowItems)
						.map((card) => card.props),
				).toStrictEqual([BalancedItem, WildItem, RedstoneItem])
				await test.endTurn()

				await test.endTurn()
				expect(
					game.currentPlayer.getDiscarded().map((card) => card.props),
				).toStrictEqual([Furnace])
				expect(
					game.currentPlayer.activeRow
						?.getItems()
						.sort(sortRowItems)
						.map((card) => card.props),
				).toStrictEqual([
					BalancedDoubleItem,
					WildDoubleItem,
					RedstoneDoubleItem,
				])
			},
		})
	})

	test('Smelting counter is reset by Emerald', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, Furnace, Emerald, Emerald],
			playerTwoDeck: [EthosLabCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(Furnace, 'attach', 0)
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(4)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(3)
				await test.playCardFromHand(Emerald, 'single_use')
				await test.applyEffect()
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.opponentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(4)
				await test.endTurn()

				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(3)
				await test.endTurn()

				await test.playCardFromHand(Emerald, 'single_use')
				await test.applyEffect()
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(4)
			},
		})
	})

	test('Smelting is not interupted by Mending or Ladder', async () => {
		await testGame({
			playerOneDeck: [
				EthosLabCommon,
				Furnace,
				BalancedItem,
				EthosLabCommon,
				BalancedItem,
				Mending,
				EthosLabCommon,
				BalancedItem,
				Ladder,
			],
			playerTwoDeck: [EthosLabCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(Furnace, 'attach', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(4)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(0)),
						),
					)?.counter,
				).toBe(3)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(BalancedItem, 'item', 1, 0)
				await test.playCardFromHand(Mending, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.attach,
					query.slot.rowIndex(1),
				)
				await test.changeActiveHermit(1)
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(1)),
						),
					)?.counter,
				).toBe(3)
				await test.endTurn()

				await test.endTurn()

				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(1)),
						),
					)?.counter,
				).toBe(2)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
				await test.playCardFromHand(BalancedItem, 'item', 2, 0)
				await test.playCardFromHand(Ladder, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.rowIndex(2),
				)
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(SmeltingEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.row(query.row.index(1)),
						),
					)?.counter,
				).toBe(2)
				await test.endTurn()

				await test.endTurn()
				await test.endTurn()
				await test.endTurn()

				expect(
					game.currentPlayer.getDiscarded().map((card) => card.props),
				).toContain(Furnace)
				expect(
					game.components.find(
						CardComponent,
						query.card.currentPlayer,
						query.card.slot(query.slot.rowIndex(0), query.slot.index(0)),
					)?.props,
				).toStrictEqual(BalancedItem)
				expect(
					game.components.find(
						CardComponent,
						query.card.currentPlayer,
						query.card.slot(query.slot.rowIndex(1), query.slot.index(0)),
					)?.props,
				).toStrictEqual(BalancedDoubleItem)
				expect(
					game.components.find(
						CardComponent,
						query.card.currentPlayer,
						query.card.slot(query.slot.rowIndex(2), query.slot.index(0)),
					)?.props,
				).toStrictEqual(BalancedItem)
			},
		})
	})
})
