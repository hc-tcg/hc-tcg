import {describe, expect, test} from '@jest/globals'
import DungeonTangoRare from 'common/cards/advent-of-tcg/hermits/dungeontango-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import MinerItem from 'common/cards/default/items/miner-common'
import Crossbow from 'common/cards/default/single-use/crossbow'
import Efficiency from 'common/cards/default/single-use/efficiency'
import {CardComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../../utils'

// Circular imports must be included last
import Piston from 'common/cards/alter-egos/single-use/piston'

describe('Test DM Tango Lackey', () => {
	test('Lackey functionality', () => {
		testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				DungeonTangoRare,
				...Array(10).fill(MinerItem),
				EthosLabCommon,
				DungeonTangoRare,
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, DungeonTangoRare, 'hermit', 0)
				yield* playCardFromHand(game, MinerItem, 'item', 0, 0)
				yield* attack(game, 'primary')
				yield* pick(
					game,
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

	test('Canceling Lackey attack and using Efficiency', () => {
		testGame({
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
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, DungeonTangoRare, 'hermit', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, MinerItem, 'item', 0, 0)
				yield* playCardFromHand(game, Crossbow, 'single_use')
				yield* attack(game, 'primary')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				yield* removeEffect(game)
				yield* playCardFromHand(game, Piston, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(1),
					query.slot.index(0),
				)
				yield* playCardFromHand(game, Efficiency, 'single_use')
				yield* applyEffect(game)
				yield* attack(game, 'primary')
				expect(game.state.pickRequests).toHaveLength(0)
				expect(
					game.components
						.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.item,
							query.slot.rowIndex(1),
							query.slot.index(0),
						)
						?.getCard()?.props,
				).toStrictEqual(MinerItem)
			},
		})
	})

	test('Failing to find a Hermit card', () => {
		testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [DungeonTangoRare, ...Array(10).fill(MinerItem)],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, DungeonTangoRare, 'hermit', 0)
				yield* playCardFromHand(game, MinerItem, 'item', 0, 0)
				yield* attack(game, 'primary')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				expect(
					game.components
						.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.item,
							query.slot.rowIndex(0),
							query.slot.index(0),
						)
						?.getCard()?.props,
				).toStrictEqual(MinerItem)
			},
		})
	})
})
