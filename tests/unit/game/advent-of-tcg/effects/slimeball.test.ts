import {describe, expect, test} from '@jest/globals'
import Slimeball from 'common/cards/advent-of-tcg/attach/slimeball'
import DungeonTangoRare from 'common/cards/advent-of-tcg/hermits/dungeontango-rare'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import LDShadowLadyRare from 'common/cards/advent-of-tcg/hermits/ldshadowlady-rare'
import MonkeyfarmRare from 'common/cards/advent-of-tcg/hermits/monkeyfarm-rare'
import String from 'common/cards/attach/string'
import WaterBucket from 'common/cards/attach/water-bucket'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import DwarfImpulseRare from 'common/cards/hermits/dwarfimpulse-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import HypnotizdRare from 'common/cards/hermits/hypnotizd-rare'
import KingJoelRare from 'common/cards/hermits/kingjoel-rare'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import MinerItem from 'common/cards/items/miner-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import CurseOfVanishing from 'common/cards/single-use/curse-of-vanishing'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import Ladder from 'common/cards/single-use/ladder'
import Lead from 'common/cards/single-use/lead'
import Looting from 'common/cards/single-use/looting'
import {
	CardComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import ExBossNineEffect, {
	supplyNineSpecial,
} from 'common/status-effects/exboss-nine'
import {testBossFight, testGame} from '../../utils'

// Circular imports must be included last
import FireCharge from 'common/cards/single-use/fire-charge'
import Piston from 'common/cards/single-use/piston'

describe('Test Slimeball', () => {
	test('Slimeball can be placed on and removed from both players', async () => {
		await testGame({
			playerOneDeck: [FarmerBeefCommon],
			playerTwoDeck: [
				EthosLabCommon,
				Slimeball,
				Slimeball,
				FireCharge,
				CurseOfVanishing,
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(FarmerBeefCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(Slimeball, 'attach', 0)
				await test.playCardFromHand(
					Slimeball,
					'attach',
					0,
					game.opponentPlayerEntity,
				)
				await test.playCardFromHand(FireCharge, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.attach,
					query.slot.rowIndex(0),
				)
				await test.playCardFromHand(CurseOfVanishing, 'single_use')
				await test.applyEffect()

				expect(
					game.components.find(
						CardComponent,
						query.card.currentPlayer,
						query.card.is(Slimeball),
						query.card.slot(query.slot.discardPile),
					),
				).not.toBe(null)
				expect(
					game.components.find(
						CardComponent,
						query.card.opponentPlayer,
						query.card.is(Slimeball),
						query.card.slot(query.slot.discardPile),
					),
				).not.toBe(null)
			},
		})
	})

	test('Slimeball prevents Lead and Piston removing items', async () => {
		await testGame({
			playerOneDeck: [
				FarmerBeefCommon,
				FarmerBeefCommon,
				Slimeball,
				BalancedItem,
				BalancedItem,
				Piston,
				Lead,
			],
			playerTwoDeck: [
				EthosLabCommon,
				EthosLabCommon,
				Slimeball,
				BalancedItem,
				Piston,
				Lead,
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(FarmerBeefCommon, 'hermit', 0)
				await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)
				await test.playCardFromHand(Slimeball, 'attach', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				expect(game.getPickableSlots(Piston.attachCondition)).toStrictEqual([])
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				expect(game.getPickableSlots(Lead.attachCondition)).toStrictEqual([])
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(Slimeball, 'attach', 1)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				await test.playCardFromHand(Piston, 'single_use')
				await test.removeEffect()
				await test.endTurn()

				await test.playCardFromHand(BalancedItem, 'item', 1, 0)
				await test.playCardFromHand(Piston, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(1),
					query.slot.index(0),
				)
				await test.pick(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(1),
				)
				await test.playCardFromHand(Lead, 'single_use')
				await test.pick(
					query.slot.opponent,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				await test.pick(
					query.slot.opponent,
					query.slot.item,
					query.slot.rowIndex(1),
					query.slot.index(0),
				)
			},
		})
	})

	test('Slimeball prevents Ladder swapping Hermits', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Slimeball, Ladder],
			playerTwoDeck: [FarmerBeefCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(Slimeball, 'attach', 0)
				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
				await test.changeActiveHermit(1)
				await test.endTurn()

				await test.playCardFromHand(FarmerBeefCommon, 'hermit', 0)
				await test.endTurn()

				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
			},
		})
	})

	test('Slimeball prevents moving the entire row, unless disabled by Golden Axe', async () => {
		await testGame(
			{
				playerOneDeck: [LDShadowLadyRare, GoldenAxe],
				playerTwoDeck: [
					PoePoeSkizzRare,
					Slimeball,
					EnderPearl,
					InstantHealthII,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(LDShadowLadyRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)
					await test.playCardFromHand(Slimeball, 'attach', 0)
					expect(
						game.getPickableSlots(EnderPearl.attachCondition),
					).toStrictEqual([])
					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					await test.endTurn()

					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PoePoeSkizzRare.health -
							LDShadowLadyRare.secondary.damage -
							40 /** Extra Damage from Lizzie's ability**/,
					)
					await test.endTurn()

					await test.playCardFromHand(InstantHealthII, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(game.currentPlayer.activeRow?.health).toBe(
						PoePoeSkizzRare.health -
							LDShadowLadyRare.secondary.damage -
							40 /** Extra Damage from Lizzie's ability**/ +
							60 /** Instant Health II */,
					)
					await test.endTurn()

					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(1)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PoePoeSkizzRare.health -
							LDShadowLadyRare.secondary.damage -
							40 /** Extra Damage from Lizzie's ability**/ +
							60 /** Instant Health II */ -
							40 /** Golden Axe damage */ -
							LDShadowLadyRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Slimeball prevents Fire Charge and Water Bucket removing items', async () => {
		await testGame({
			playerOneDeck: [FarmerBeefCommon, WaterBucket, FireCharge],
			playerTwoDeck: [EthosLabCommon, Slimeball, String],
			testGame: async (test, game) => {
				await test.playCardFromHand(FarmerBeefCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(
					Slimeball,
					'attach',
					0,
					game.opponentPlayerEntity,
				)
				await test.playCardFromHand(
					String,
					'item',
					0,
					0,
					game.opponentPlayerEntity,
				)
				await test.endTurn()

				await test.playCardFromHand(FireCharge, 'single_use')
				expect(
					game.components.filter(
						SlotComponent,
						game.state.pickRequests[0].canPick,
					),
				).toStrictEqual(
					game.components.filter(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.active,
						query.slot.attach,
					),
				)
				await test.removeEffect()
				await test.playCardFromHand(WaterBucket, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.active,
					query.slot.hermit,
				)
				expect(
					game.components.find(CardComponent, query.card.is(String))?.slot.type,
				).toBe('item')
			},
		})
	})

	test('Slimeball prevents Hermits from removing items', async () => {
		await testGame(
			{
				playerOneDeck: [
					DungeonTangoRare,
					HypnotizdRare,
					Slimeball,
					Slimeball,
					MinerItem,
					MinerItem,
				],
				playerTwoDeck: [MonkeyfarmRare, KingJoelRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(DungeonTangoRare, 'hermit', 0)
					await test.playCardFromHand(HypnotizdRare, 'hermit', 1)
					await test.playCardFromHand(Slimeball, 'attach', 0)
					await test.playCardFromHand(Slimeball, 'attach', 1)
					await test.playCardFromHand(MinerItem, 'item', 1, 0)
					await test.endTurn()

					await test.playCardFromHand(MonkeyfarmRare, 'hermit', 0)
					await test.playCardFromHand(KingJoelRare, 'hermit', 1)
					await test.attack('secondary') // Test "Monkeystep"
					expect(game.state.pickRequests).toHaveLength(0)
					await test.endTurn()

					await test.playCardFromHand(MinerItem, 'item', 0, 0)
					await test.attack('primary') // Test "Lackey"
					expect(game.state.pickRequests).toHaveLength(0)
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.attack('secondary') // Test "Steal"
					expect(game.state.pickRequests).toHaveLength(0)
					await test.endTurn()

					await test.attack('secondary') // Test "Got 'Em"
					expect(game.state.pickRequests).toHaveLength(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Slimeball prevents Looting removing items, unless disabled by Golden Axe', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Slimeball, BalancedItem],
				playerTwoDeck: [GeminiTayRare, GoldenAxe, Looting],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Slimeball, 'attach', 0)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					expect(game.getPickableSlots(Looting.attachCondition)).toStrictEqual(
						[],
					)
					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')
					await test.playCardFromHand(Looting, 'single_use')
					await test.applyEffect()
					await test.pick(
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)
					expect(
						game.currentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([BalancedItem])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Golden Axe + Lead can remove an item card from a row with Slimeball', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					Slimeball,
					BalancedItem,
				],
				playerTwoDeck: [GeminiTayRare, GoldenAxe, Lead],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Slimeball, 'attach', 0)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')
					await test.playCardFromHand(Lead, 'single_use')
					await test.pick(
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(
								query.slot.item,
								query.slot.rowIndex(1),
								query.slot.index(0),
							),
						)?.props,
					).toStrictEqual(BalancedItem)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Slimeball prevents Evil Xisuma boss discarding an item card, unless EX uses NINEATTACHED', async () => {
		testBossFight(
			{
				playerDeck: [EthosLabCommon, Slimeball, BalancedItem],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Slimeball, 'attach', 0)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
					await test.bossAttack('50DMG', 'HEAL150', 'ITEMCARD')
					expect(game.state.pickRequests).toHaveLength(0)
					expect(
						game.components.find(CardComponent, query.card.is(BalancedItem))
							?.slot.type,
					).toBe('item')

					while (game.state.turn.turnNumber < 18) {
						await test.endTurn()
					}

					supplyNineSpecial(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ExBossNineEffect),
						)!,
						'NINEATTACHED',
					)
					await test.endTurn()

					expect(
						game.currentPlayer
							.getDiscarded()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([Slimeball, BalancedItem])
				},
			},
			{startWithAllCards: true},
		)
	})

	// Test interactions with Grianch which allows two attacks in one turn
	test('King Joel and Monkeyfarm can remove an item card from a row with Slimeball when disabled by D. Impulse secondary', async () => {
		await testGame(
			{
				playerOneDeck: [
					GrianchRare,
					EthosLabCommon,
					Slimeball,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [
					ZombieCleoRare,
					DwarfImpulseRare,
					KingJoelRare,
					MonkeyfarmRare,
					BadOmen,
					GoldenAxe,
					GoldenAxe,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Slimeball, 'attach', 0)
					await test.playCardFromHand(BalancedItem, 'item', 1, 0)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(DwarfImpulseRare, 'hermit', 1)
					await test.playCardFromHand(MonkeyfarmRare, 'hermit', 2)
					await test.playCardFromHand(KingJoelRare, 'hermit', 3)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(BalancedItem, 'item', 1, 1)
					await test.attack('secondary')
					await test.endTurn()

					// Attack with "Can I Axe You A Question?"
					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					// Attack with "Monkeystep"
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
							query.card.is(BalancedItem),
						),
					).not.toBe(null)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					// Attack with "Can I Axe You A Question?"
					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					// Attack with "Steal"
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(1),
					)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(0),
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(
								query.slot.item,
								query.slot.rowIndex(1),
								query.slot.index(0),
							),
							query.card.is(BalancedItem),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
