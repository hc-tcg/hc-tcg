import {describe, expect, test} from '@jest/globals'
import Trapdoor from 'common/cards/advent-of-tcg/attach/trapdoor'
import ArrowOfPoison from 'common/cards/advent-of-tcg/single-use/arrow-of-poison'
import LightningRod from 'common/cards/attach/lightning-rod'
import MilkBucket from 'common/cards/attach/milk-bucket'
import WaterBucket from 'common/cards/attach/water-bucket'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import RenbobRare from 'common/cards/hermits/renbob-rare'
import SpookyStressRare from 'common/cards/hermits/spookystress-rare'
import Bow from 'common/cards/single-use/bow'
import Egg from 'common/cards/single-use/egg'
import {
	CardComponent,
	RowComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import PoisonEffect from 'common/status-effects/poison'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Arrow of Poison', () => {
	test('Anvil Drop triggers Arrow of Poison', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [GoatfatherRare, ArrowOfPoison],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 0)
					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Hyperspace triggers Arrow of Poison', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [RenbobRare, ArrowOfPoison],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, RenbobRare, 'hermit', 1)
					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Wa'a triggers Arrow of Poison", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [SpookyStressRare, WaterBucket, ArrowOfPoison],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SpookyStressRare, 'hermit', 0)
					yield* playCardFromHand(game, WaterBucket, 'attach', 0)
					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Lightning Rod triggers Arrow of Poison', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Trapdoor triggers Arrow of Poison', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Trapdoor],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Egg does not trigger Arrow of Poison', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(1)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 10 /** Egg heads */,
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Arrow of Poison works when stolen by Traphole', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ArrowOfPoison, Bow],
				playerTwoDeck: [HelsknightRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, HelsknightRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).not.toBe(null)
					expect(
						game.opponentPlayer
							.getHand()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([ArrowOfPoison, Bow])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Attached Milk Bucket prevents Arrow of Poison effect', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, MilkBucket],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison, Bow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, MilkBucket, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ArrowOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /** Bow */)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PoisonEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.slot(query.slot.rowIndex(1)),
							),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
