import assert from 'assert'
import {describe, expect, test} from '@jest/globals'
import Furnace from 'common/cards/advent-of-tcg/attach/furnace'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import RedstoneItem from 'common/cards/items/redstone-common'
import RedstoneDoubleItem from 'common/cards/items/redstone-rare'
import WildItem from 'common/cards/items/wild-common'
import WildDoubleItem from 'common/cards/items/wild-rare'
import Emerald from 'common/cards/single-use/emerald'
import Ladder from 'common/cards/single-use/ladder'
import Mending from 'common/cards/single-use/mending'
import {CardComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import SmeltingEffect from 'common/status-effects/smelting'
import {
	applyEffect,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

function sortRowItems(a: CardComponent, b: CardComponent): number {
	assert(a.slot.inRow() && a.slot.index !== null)
	assert(b.slot.inRow() && b.slot.index !== null)
	return a.slot.index - b.slot.index
}

describe('Test Furnace Attach Effect', () => {
	test('Basic functionality', () => {
		testGame({
			playerOneDeck: [
				EthosLabCommon,
				Furnace,
				BalancedItem,
				WildItem,
				RedstoneItem,
			],
			playerTwoDeck: [EthosLabCommon],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				yield* playCardFromHand(game, Furnace, 'attach', 0)
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
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, WildItem, 'item', 0, 1)
				yield* endTurn(game)

				yield* endTurn(game)

				yield* playCardFromHand(game, RedstoneItem, 'item', 0, 2)
				yield* endTurn(game)

				yield* endTurn(game)

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
				yield* endTurn(game)

				yield* endTurn(game)
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

	test('Smelting counter is reset by Emerald', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, Furnace, Emerald, Emerald],
			playerTwoDeck: [EthosLabCommon],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, Furnace, 'attach', 0)
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
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

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
				yield* playCardFromHand(game, Emerald, 'single_use')
				yield* applyEffect(game)
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
				yield* endTurn(game)

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
				yield* endTurn(game)

				yield* playCardFromHand(game, Emerald, 'single_use')
				yield* applyEffect(game)
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

	test('Smelting is not interupted by Mending or Ladder', () => {
		testGame({
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
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, Furnace, 'attach', 0)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
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
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

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
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, BalancedItem, 'item', 1, 0)
				yield* playCardFromHand(game, Mending, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.attach,
					query.slot.rowIndex(1),
				)
				yield* changeActiveHermit(game, 1)
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
				yield* endTurn(game)

				yield* endTurn(game)

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
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
				yield* playCardFromHand(game, BalancedItem, 'item', 2, 0)
				yield* playCardFromHand(game, Ladder, 'single_use')
				yield* pick(
					game,
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
				yield* endTurn(game)

				yield* endTurn(game)
				yield* endTurn(game)
				yield* endTurn(game)

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
