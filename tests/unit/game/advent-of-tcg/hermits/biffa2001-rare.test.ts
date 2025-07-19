import {describe, expect, test} from '@jest/globals'
import Biffa2001Rare from 'common/cards/advent-of-tcg/hermits/biffa2001-rare'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import Allay from 'common/cards/advent-of-tcg/single-use/allay'
import {IronArmor} from 'common/cards/attach/armor'
import ArmorStand from 'common/cards/attach/armor-stand'
import Totem from 'common/cards/attach/totem'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import WormManRare from 'common/cards/hermits/wormman-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import MinerDoubleItem from 'common/cards/items/miner-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Chest from 'common/cards/single-use/chest'
import FlintAndSteel from 'common/cards/single-use/flint-and-steel'
import {InstantHealth} from 'common/cards/single-use/instant-health'
import Knockback from 'common/cards/single-use/knockback'
import PotionOfSlowness from 'common/cards/single-use/potion-of-slowness'
import {IronSword} from 'common/cards/single-use/sword'
import Trident from 'common/cards/single-use/trident'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../../utils'

describe('Test Biffa Secondary', () => {
	test("Biffa's Museum functionality", async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
			playerTwoDeck: [Biffa2001Rare, MinerDoubleItem, IronArmor, InstantHealth],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
				await test.endTurn()

				await test.playCardFromHand(Biffa2001Rare, 'hermit', 0)
				await test.playCardFromHand(MinerDoubleItem, 'item', 0, 0)
				await test.attack('secondary')
				expect(game.opponentPlayer.activeRow?.health).toBe(
					EthosLabCommon.health -
						Biffa2001Rare.secondary.damage -
						20 * 2 /** placed 1 Hermit and 1 Item card */,
				)
				await test.endTurn()

				await test.changeActiveHermit(1)
				await test.endTurn()

				await test.attack('secondary')
				expect(game.opponentPlayer.activeRow?.health).toBe(
					EthosLabCommon.health - Biffa2001Rare.secondary.damage,
				)
				await test.endTurn()

				await test.changeActiveHermit(2)
				await test.endTurn()

				await test.playCardFromHand(IronArmor, 'attach', 0)
				await test.playCardFromHand(InstantHealth, 'single_use')
				await test.removeEffect()
				await test.playCardFromHand(InstantHealth, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.active,
				)
				await test.attack('secondary')
				expect(game.opponentPlayer.activeRow?.health).toBe(
					EthosLabCommon.health -
						Biffa2001Rare.secondary.damage -
						20 * 2 /** placed 1 Attach and used 1 Single Use card */,
				)
				await test.endTurn()
			},
		})
	})

	test("Biffa's Museum + Knockback does not knock-out hermit as it is revived", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [Biffa2001Rare, Knockback],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Totem, 'attach', 0)
					// Manually set Etho (1) health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(0),
					)!.health = 10
					await test.endTurn()

					await test.playCardFromHand(Biffa2001Rare, 'hermit', 1)
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Biffa's Museum works when a Single Use requires confirmation", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [Biffa2001Rare, PotionOfSlowness],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Biffa2001Rare, 'hermit', 1)
					await test.playCardFromHand(PotionOfSlowness, 'single_use')
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					await test.removeEffect()
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							Biffa2001Rare.secondary.damage -
							20 /** placed 1 Hermit card, did not apply the Single Use */,
					)
					await test.endTurn()

					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([PotionOfSlowness])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Biffa's Museum counts playing a card after using Chest", async () => {
		await testGame(
			{
				playerOneDeck: [Biffa2001Rare, ArmorStand, Chest],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(Biffa2001Rare, 'hermit', 0)
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(0)
					await test.playCardFromHand(Chest, 'single_use')
					await test.finishModalRequest({
						result: true,
						cards: game.components.filterEntities(
							CardComponent,
							query.card.is(ArmorStand),
						),
					})
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							Biffa2001Rare.secondary.damage -
							40 /** used 1 Single Use and placed 1 Attach card */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Biffa's Museum counts playing a card after using Flint & Steel", async () => {
		await testGame(
			{
				playerOneDeck: [
					Biffa2001Rare,
					FlintAndSteel,
					...Array(9).fill(ArmorStand),
				],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(Biffa2001Rare, 'hermit', 0)
					game.currentPlayer
						.getHand()
						.sort(CardComponent.compareOrder)
						.slice(2)
						.forEach((card) => card.discard())
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(FlintAndSteel, 'single_use')
					await test.applyEffect()
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							Biffa2001Rare.secondary.damage -
							40 /** used 1 Single Use and placed 1 Attach card */,
					)
				},
			},
			{startWithAllCards: false, noItemRequirements: true},
		)
	})

	test("Biffa's Museum counts playing a card after using Allay", async () => {
		await testGame(
			{
				playerOneDeck: [Biffa2001Rare, ArmorStand, ArmorStand, Allay],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(Biffa2001Rare, 'hermit', 0)
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(0)
					await test.playCardFromHand(Allay, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hand,
						query.slot.has(ArmorStand),
					)
					await test.finishModalRequest({result: false, cards: null})
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							Biffa2001Rare.secondary.damage -
							40 /** used 1 Single Use and placed 1 Attach card */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	// Test interactions with Grianch which allows two attacks in one turn
	test("Biffa's Museum uses running total against Grianch", async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare],
				playerTwoDeck: [Biffa2001Rare, BadOmen, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Biffa2001Rare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							20 /** Iron Sword */ -
							Biffa2001Rare.secondary.damage -
							20 /** Used 1 single use this turn */,
					)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							20 /** Iron Sword */ -
							Biffa2001Rare.secondary.damage -
							20 /** Used 1 single use this turn */ -
							Biffa2001Rare.secondary.damage -
							20 /** Used 1 single use this turn */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test("Biffa's Museum counts playing a card face down with Total Anonymity after Trident flips heads", async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare],
				playerTwoDeck: [
					ZombieCleoRare,
					WormManRare,
					BadOmen,
					Trident,
					Biffa2001Rare,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(WormManRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							WormManRare.secondary.damage -
							30 /** Trident */,
					)
					await test.playCardFromHand(Biffa2001Rare, 'hermit', 2)
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							WormManRare.secondary.damage -
							30 /** Trident */ -
							Biffa2001Rare.secondary.damage -
							40 /** used 1 Single Use and placed 1 Hermit card */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
