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
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Pharaoh Xibalba', () => {
	test('Xibalba Functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PharaohRare],
				playerTwoDeck: [EthosLabCommon, Knockback, DiamondArmor],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
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
					yield* endTurn(game)

					yield* playCardFromHand(game, DiamondArmor, 'attach', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
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

	test('Xibalba + Potion of Weakness', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare, PotionOfWeakness],
				playerTwoDeck: [EthosLabCommon, DiamondArmor, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondArmor, 'attach', 0)
					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
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

	test('Xibalba + Potion of Invisibility', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare, BadOmen],
				playerTwoDeck: [EthosLabCommon, InvisibilityPotion, InvisibilityPotion],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
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
					yield* endTurn(game)

					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
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

	test('Xibalba + Trapdoor', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, Trapdoor, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
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

	test('Xibalba + 4 Trapdoors', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare],
				playerTwoDeck: [
					...Array(5).fill(EthosLabCommon),
					...Array(4).fill(Trapdoor),
					Knockback,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 4)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 2)
					yield* playCardFromHand(game, Trapdoor, 'attach', 3)
					yield* playCardFromHand(game, Trapdoor, 'attach', 4)
					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
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

	test('Xibalba + TNT against Invisibility heads', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare, TNT],
				playerTwoDeck: [EthosLabCommon, InvisibilityPotion],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, TNT, 'single_use')
					yield* attack(game, 'secondary')
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
					yield* pick(
						game,
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
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba + Bow against Wolf + Thorns + Turtle Shell', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, Thorns, 'attach', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 2)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

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
					yield* pick(
						game,
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
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Xibalba against Soulmate + Shield', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, PharaohRare],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, Shield, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Shield, 'attach', 0)
					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(0),
					)!.health = 10
					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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
					yield* pick(
						game,
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
	test('Soulmate + Xibalba against Wolf knock-out', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, GrianchRare, 'hermit', 1)
					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, DiamondArmor, 'attach', 1)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 0)
					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 1)
					yield* playCardFromHand(game, PharaohRare, 'hermit', 2)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(game.opponentPlayer.activeRow?.health).toBe(GrianchRare.health)
					expect(game.currentPlayer.activeRow?.health).toBe(
						ZombieCleoRare.health,
					)
					// Manually set Cleo health to trigger zone
					game.currentPlayer.activeRow!.health = 10
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
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
					yield* pick(
						game,
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
