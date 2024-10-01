import {describe, expect, test} from '@jest/globals'
import Slimeball from 'common/cards/advent-of-tcg/effects/slimeball'
import DungeonTangoRare from 'common/cards/advent-of-tcg/hermits/dungeontango-rare'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import LDShadowLadyRare from 'common/cards/advent-of-tcg/hermits/ldshadowlady-rare'
import MonkeyfarmRare from 'common/cards/advent-of-tcg/hermits/monkeyfarm-rare'
import DwarfImpulseRare from 'common/cards/alter-egos-iii/hermits/dwarfimpulse-rare'
import KingJoelRare from 'common/cards/alter-egos-iii/hermits/kingjoel-rare'
import PoePoeSkizzRare from 'common/cards/alter-egos-iii/hermits/poepoeskizz-rare'
import String from 'common/cards/alter-egos/effects/string'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'
import EnderPearl from 'common/cards/alter-egos/single-use/ender-pearl'
import Ladder from 'common/cards/alter-egos/single-use/ladder'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import WaterBucket from 'common/cards/default/effects/water-bucket'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/default/hermits/geminitay-rare'
import HypnotizdRare from 'common/cards/default/hermits/hypnotizd-rare'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import ZombieCleoRare from 'common/cards/default/hermits/zombiecleo-rare'
import BalancedItem from 'common/cards/default/items/balanced-common'
import MinerItem from 'common/cards/default/items/miner-common'
import CurseOfVanishing from 'common/cards/default/single-use/curse-of-vanishing'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import Lead from 'common/cards/default/single-use/lead'
import Looting from 'common/cards/default/single-use/looting'
import {
	CardComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import ExBossNineEffect, {
	supplyNineSpecial,
} from 'common/status-effects/exboss-nine'
import {
	applyEffect,
	attack,
	bossAttack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	removeEffect,
	testBossFight,
	testGame,
} from '../utils'

// Circular imports must be included last
import FireCharge from 'common/cards/alter-egos/single-use/fire-charge'
import Piston from 'common/cards/alter-egos/single-use/piston'

describe('Test Slimeball', () => {
	test('Slimeball can be placed on and removed from both players', () => {
		testGame({
			playerOneDeck: [Iskall85Common],
			playerTwoDeck: [
				EthosLabCommon,
				Slimeball,
				Slimeball,
				FireCharge,
				CurseOfVanishing,
			],
			saga: function* (game) {
				yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, Slimeball, 'attach', 0)
				yield* playCardFromHand(
					game,
					Slimeball,
					'attach',
					0,
					game.opponentPlayerEntity,
				)
				yield* playCardFromHand(game, FireCharge, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.attach,
					query.slot.rowIndex(0),
				)
				yield* playCardFromHand(game, CurseOfVanishing, 'single_use')
				yield* applyEffect(game)

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

	test('Slimeball prevents Lead and Piston removing items', () => {
		testGame({
			playerOneDeck: [
				Iskall85Common,
				Iskall85Common,
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
			saga: function* (game) {
				yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
				yield* playCardFromHand(game, Iskall85Common, 'hermit', 1)
				yield* playCardFromHand(game, Slimeball, 'attach', 0)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				expect(game.getPickableSlots(Piston.attachCondition)).toStrictEqual([])
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				expect(game.getPickableSlots(Lead.attachCondition)).toStrictEqual([])
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, Slimeball, 'attach', 1)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				yield* playCardFromHand(game, Piston, 'single_use')
				yield* removeEffect(game)
				yield* endTurn(game)

				yield* playCardFromHand(game, BalancedItem, 'item', 1, 0)
				yield* playCardFromHand(game, Piston, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(1),
					query.slot.index(0),
				)
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(1),
				)
				yield* playCardFromHand(game, Lead, 'single_use')
				yield* pick(
					game,
					query.slot.opponent,
					query.slot.item,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				yield* pick(
					game,
					query.slot.opponent,
					query.slot.item,
					query.slot.rowIndex(1),
					query.slot.index(0),
				)
			},
		})
	})

	test('Slimeball prevents Ladder swapping Hermits', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Slimeball, Ladder],
			playerTwoDeck: [Iskall85Common],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, Slimeball, 'attach', 0)
				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
				yield* changeActiveHermit(game, 1)
				yield* endTurn(game)

				yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
				yield* endTurn(game)

				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
			},
		})
	})

	test('Slimeball prevents moving the entire row, unless disabled by Golden Axe', () => {
		testGame(
			{
				playerOneDeck: [LDShadowLadyRare, GoldenAxe],
				playerTwoDeck: [PoePoeSkizzRare, Slimeball, EnderPearl],
				saga: function* (game) {
					yield* playCardFromHand(game, LDShadowLadyRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, PoePoeSkizzRare, 'hermit', 0)
					yield* playCardFromHand(game, Slimeball, 'attach', 0)
					expect(
						game.getPickableSlots(EnderPearl.attachCondition),
					).toStrictEqual([])
					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PoePoeSkizzRare.health - LDShadowLadyRare.secondary.damage,
					)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(1)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PoePoeSkizzRare.health -
							LDShadowLadyRare.secondary.damage -
							40 /** Golden Axe damage */ -
							LDShadowLadyRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Slimeball prevents Fire Charge and Water Bucket removing items', () => {
		testGame({
			playerOneDeck: [Iskall85Common, WaterBucket, FireCharge],
			playerTwoDeck: [EthosLabCommon, Slimeball, String],
			saga: function* (game) {
				yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(
					game,
					Slimeball,
					'attach',
					0,
					game.opponentPlayerEntity,
				)
				yield* playCardFromHand(
					game,
					String,
					'item',
					0,
					0,
					game.opponentPlayerEntity,
				)
				yield* endTurn(game)

				yield* playCardFromHand(game, FireCharge, 'single_use')
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
				yield* removeEffect(game)
				yield* playCardFromHand(game, WaterBucket, 'single_use')
				yield* pick(
					game,
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

	test('Slimeball prevents Hermits from removing items', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, DungeonTangoRare, 'hermit', 0)
					yield* playCardFromHand(game, HypnotizdRare, 'hermit', 1)
					yield* playCardFromHand(game, Slimeball, 'attach', 0)
					yield* playCardFromHand(game, Slimeball, 'attach', 1)
					yield* playCardFromHand(game, MinerItem, 'item', 1, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, MonkeyfarmRare, 'hermit', 0)
					yield* playCardFromHand(game, KingJoelRare, 'hermit', 1)
					yield* attack(game, 'secondary') // Test "Monkeystep"
					expect(game.state.pickRequests).toHaveLength(0)
					yield* endTurn(game)

					yield* playCardFromHand(game, MinerItem, 'item', 0, 0)
					yield* attack(game, 'primary') // Test "Lackey"
					expect(game.state.pickRequests).toHaveLength(0)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary') // Test "Steal"
					expect(game.state.pickRequests).toHaveLength(0)
					yield* endTurn(game)

					yield* attack(game, 'secondary') // Test "Got 'Em"
					expect(game.state.pickRequests).toHaveLength(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Slimeball prevents Looting removing items, unless disabled by Golden Axe', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Slimeball, BalancedItem],
				playerTwoDeck: [GeminiTayRare, GoldenAxe, Looting],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Slimeball, 'attach', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					expect(game.getPickableSlots(Looting.attachCondition)).toStrictEqual(
						[],
					)
					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, Looting, 'single_use')
					yield* applyEffect(game)
					yield* pick(
						game,
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

	test('Golden Axe + Lead can remove an item card from a row with Slimeball', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					Slimeball,
					BalancedItem,
				],
				playerTwoDeck: [GeminiTayRare, GoldenAxe, Lead],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Slimeball, 'attach', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, Lead, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)
					yield* pick(
						game,
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

	test('Slimeball prevents Evil Xisuma boss discarding an item card, unless EX uses NINEATTACHED', () => {
		testBossFight(
			{
				playerDeck: [EthosLabCommon, Slimeball, BalancedItem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Slimeball, 'attach', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
					yield* bossAttack(game, '50DMG', 'HEAL150', 'ITEMCARD')
					expect(game.state.pickRequests).toHaveLength(0)
					expect(
						game.components.find(CardComponent, query.card.is(BalancedItem))
							?.slot.type,
					).toBe('item')

					while (game.state.turn.turnNumber < 18) {
						yield* endTurn(game)
					}

					supplyNineSpecial(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ExBossNineEffect),
						)!,
						'NINEATTACHED',
					)
					yield* endTurn(game)

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
	test('King Joel and Monkeyfarm can remove an item card from a row with Slimeball when disabled by D. Impulse secondary', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Slimeball, 'attach', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 1, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, DwarfImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, MonkeyfarmRare, 'hermit', 2)
					yield* playCardFromHand(game, KingJoelRare, 'hermit', 3)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BalancedItem, 'item', 1, 1)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Attack with "Can I Axe You A Question?"
					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					// Attack with "Monkeystep"
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
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
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Attack with "Can I Axe You A Question?"
					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					// Attack with "Steal"
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.item,
						query.slot.rowIndex(1),
						query.slot.index(1),
					)
					yield* pick(
						game,
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
