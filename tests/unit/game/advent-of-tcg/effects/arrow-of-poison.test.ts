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
import {testGame} from '../../utils'

describe('Test Arrow of Poison', () => {
	test('Anvil Drop triggers Arrow of Poison', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [GoatfatherRare, ArrowOfPoison],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GoatfatherRare, 'hermit', 0)
					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
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

	test('Hyperspace triggers Arrow of Poison', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [RenbobRare, ArrowOfPoison],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(RenbobRare, 'hermit', 1)
					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
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

	test("Wa'a triggers Arrow of Poison", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [SpookyStressRare, WaterBucket, ArrowOfPoison],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(SpookyStressRare, 'hermit', 0)
					await test.playCardFromHand(WaterBucket, 'attach', 0)
					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
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

	test('Lightning Rod triggers Arrow of Poison', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
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

	test('Trapdoor triggers Arrow of Poison', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Trapdoor],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
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

	test('Egg does not trigger Arrow of Poison', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')
					await test.pick(
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

	test('Arrow of Poison works when stolen by Traphole', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, ArrowOfPoison, Bow],
				playerTwoDeck: [HelsknightRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(HelsknightRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('secondary')
					await test.pick(
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

	test('Attached Milk Bucket prevents Arrow of Poison effect', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, MilkBucket],
				playerTwoDeck: [EthosLabCommon, ArrowOfPoison, Bow],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(MilkBucket, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ArrowOfPoison, 'single_use')
					await test.applyEffect()
					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('secondary')
					await test.pick(
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
