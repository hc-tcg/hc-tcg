import {describe, expect, test} from '@jest/globals'
import Trapdoor from 'common/cards/advent-of-tcg/attach/trapdoor'
import BigBSt4tzRare from 'common/cards/advent-of-tcg/hermits/bigbst4tz2-rare'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import PharaohRare from 'common/cards/advent-of-tcg/hermits/pharaoh-rare'
import {DiamondArmor} from 'common/cards/attach/armor'
import Shield from 'common/cards/attach/shield'
import {Thorns} from 'common/cards/attach/thorns'
import TurtleShell from 'common/cards/attach/turtle-shell'
import Wolf from 'common/cards/attach/wolf'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Bow from 'common/cards/single-use/bow'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import Knockback from 'common/cards/single-use/knockback'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import TNT from 'common/cards/single-use/tnt'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {WEAKNESS_DAMAGE} from 'common/const/damage'
import {soulmateEffectDamage} from 'common/status-effects/soulmate'
import {testGame} from '../../utils'

describe('Test Pharaoh Xibalba', () => {
	test('Xibalba Functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PharaohRare],
				playerTwoDeck: [EthosLabCommon, Knockback, DiamondArmor],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(PharaohRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							PharaohRare.secondary.damage,
					)
					await test.endTurn()

					await test.playCardFromHand(DiamondArmor, 'attach', 0)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							(PharaohRare.secondary.damage - 20) /** Diamond Armor */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba + Potion of Weakness', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare, PotionOfWeakness],
				playerTwoDeck: [EthosLabCommon, DiamondArmor, Knockback],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PharaohRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(DiamondArmor, 'attach', 0)
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					const attackDamage =
						PharaohRare.secondary.damage -
						20 /** Diamond Armor */ +
						WEAKNESS_DAMAGE
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - attackDamage)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							attackDamage /** Healing from Xibalba */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba + Potion of Invisibility', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare, BadOmen],
				playerTwoDeck: [EthosLabCommon, InvisibilityPotion, InvisibilityPotion],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PharaohRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.secondary.damage)
					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - PharaohRare.secondary.damage * 2)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							PharaohRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba + Trapdoor', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, Trapdoor, Knockback],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PharaohRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							PharaohRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba + 4 Trapdoors', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare],
				playerTwoDeck: [
					...Array(5).fill(EthosLabCommon),
					...Array(4).fill(Trapdoor),
					Knockback,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PharaohRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 4)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.playCardFromHand(Trapdoor, 'attach', 2)
					await test.playCardFromHand(Trapdoor, 'attach', 3)
					await test.playCardFromHand(Trapdoor, 'attach', 4)
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							PharaohRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba + TNT against Invisibility heads', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare, TNT],
				playerTwoDeck: [EthosLabCommon, InvisibilityPotion],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PharaohRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(TNT, 'single_use')
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - 60 /** TNT */)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(PharaohRare.health - 20 /** TNT backlash */)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							80 /** total TNT damage */,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba + Bow against Wolf + Thorns + Turtle Shell', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare, Bow],
				playerTwoDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					Wolf,
					Thorns,
					TurtleShell,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PharaohRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(Wolf, 'attach', 0)
					await test.playCardFromHand(Thorns, 'attach', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 2)
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.changeActiveHermit(2)
					await test.endTurn()

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
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /** Bow */)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(PharaohRare.health - 20 /** Wolf */ - 20 /** Thorns */)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.secondary.damage +
							40 /** Xibalba healing from Bow only */,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba against Soulmate + Shield', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, Shield, Knockback],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PharaohRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Shield, 'attach', 0)
					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(0),
					)!.health = 10
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BigBSt4tzRare.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(null)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							BigBSt4tzRare.secondary.damage +
							(PharaohRare.secondary.damage - 60) /** Shield */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	// Test interactions with Grianch which allows two attacks in one turn
	test('Soulmate + Xibalba against Wolf knock-out', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					GrianchRare,
					Wolf,
					DiamondArmor,
					InvisibilityPotion,
					Knockback,
				],
				playerTwoDeck: [BigBSt4tzRare, ZombieCleoRare, PharaohRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(GrianchRare, 'hermit', 1)
					await test.playCardFromHand(Wolf, 'attach', 0)
					await test.playCardFromHand(DiamondArmor, 'attach', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 1)
					await test.playCardFromHand(PharaohRare, 'hermit', 2)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.opponentPlayer.activeRow?.health).toBe(GrianchRare.health)
					expect(game.currentPlayer.activeRow?.health).toBe(
						ZombieCleoRare.health,
					)
					// Manually set Cleo health to trigger zone
					game.currentPlayer.activeRow!.health = 10
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							(PharaohRare.secondary.damage - 20) /** Diamond Armor */ -
							soulmateEffectDamage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(BigBSt4tzRare.health - GrianchRare.secondary.damage)
					expect(game.currentPlayer.activeRow).toBe(null)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						BigBSt4tzRare.health -
							GrianchRare.secondary.damage +
							(PharaohRare.secondary.damage - 20) /** Diamond Armor */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
