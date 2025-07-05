import {describe, expect, test} from '@jest/globals'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import Totem from 'common/cards/attach/totem'
import ArchitectFalseRare from 'common/cards/hermits/architectfalse-rare'
import BeetlejhostRare from 'common/cards/hermits/beetlejhost-rare'
import BoomerBdubsRare from 'common/cards/hermits/boomerbdubs-rare'
import DwarfImpulseRare from 'common/cards/hermits/dwarfimpulse-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EvilXisumaRare from 'common/cards/hermits/evilxisuma_rare'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import PearlescentMoonRare from 'common/cards/hermits/pearlescentmoon-rare'
import PoultryManRare from 'common/cards/hermits/poultryman-rare'
import RendogRare from 'common/cards/hermits/rendog-rare'
import SkizzlemanRare from 'common/cards/hermits/skizzleman-rare'
import WormManRare from 'common/cards/hermits/wormman-rare'
import ZedaphPlaysRare from 'common/cards/hermits/zedaphplays-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import BuilderItem from 'common/cards/items/builder-common'
import PvPDoubleItem from 'common/cards/items/pvp-rare'
import Anvil from 'common/cards/single-use/anvil'
import BadOmen from 'common/cards/single-use/bad-omen'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import Efficiency from 'common/cards/single-use/efficiency'
import Egg from 'common/cards/single-use/egg'
import Fortune from 'common/cards/single-use/fortune'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import {
	CardComponent,
	RowComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import {WEAKNESS_DAMAGE} from 'common/const/damage'
import BadOmenEffect from 'common/status-effects/badomen'
import ChromaKeyedEffect from 'common/status-effects/chroma-keyed'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from 'common/status-effects/singleturn-attack-disabled'
import {testGame} from '../../utils'

describe('Test The Grianch Naughty', () => {
	test('Fortune only applies to first flip for Naughty per turn', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, BadOmen],
				playerTwoDeck: [
					ZombieCleoRare,
					BadOmen,
					GrianchRare,
					GeminiTayRare,
					Fortune,
					Fortune,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(GrianchRare, 'hermit', 1)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 2)
					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Boomer Bdubs "Watch This" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, BadOmen],
				playerTwoDeck: [BoomerBdubsRare, BadOmen, Fortune],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.finishModalRequest({result: true, cards: null})
					await test.finishModalRequest({result: true, cards: null})
					await test.attack('secondary')
					await test.finishModalRequest({result: true, cards: null})
					await test.finishModalRequest({result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health - (BoomerBdubsRare.secondary.damage + 20),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Pearl "Aussie Ping" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, Fortune],
				playerTwoDeck: [PearlescentMoonRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PearlescentMoonRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PearlescentMoonRare.health -
							GrianchRare.secondary.damage -
							WEAKNESS_DAMAGE /** Builder -> Terraform */,
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					expect(
						game.currentPlayer.coinFlips.filter(
							(coinFlip) => coinFlip.opponentFlip,
						),
					).toHaveLength(1)
					await test.attack('secondary')
					expect(
						game.currentPlayer.coinFlips.filter(
							(coinFlip) => coinFlip.opponentFlip,
						),
					).toHaveLength(1)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PearlescentMoonRare.health -
							GrianchRare.secondary.damage -
							WEAKNESS_DAMAGE /** Builder -> Terraform */,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Invisibility only affects the first attack in a turn', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					InvisibilityPotion,
					InvisibilityPotion,
				],
				playerTwoDeck: [GrianchRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - GrianchRare.secondary.damage,
					)
					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - GrianchRare.secondary.damage * 2,
					)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							GrianchRare.secondary.damage * 2 -
							GrianchRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Skizz "Gas Light" twice + Totem revive', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, Totem],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Totem, 'attach', 1)
					// Manually set Etho health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(1),
					)!.health = 20
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							SkizzlemanRare.secondary.damage -
							30 /* Anvil damage */ -
							SkizzlemanRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Skizz "Gas Light" twice + Invisibility heads', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							30 /* Anvil damage */ -
							SkizzlemanRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - 10 /** Anvil damage */ - 20 /** Gaslight */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Skizz "Gas Light" twice + Invisibility tails', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							SkizzlemanRare.secondary.damage * 2 -
							30 /* Anvil damage */ -
							SkizzlemanRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							10 /** Anvil damage */ -
							60 /** Gaslight x2 + x1 */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Skizz "Gas Light" after Anvil', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('single-use')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							30 /* Anvil damage */ -
							SkizzlemanRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - 10 /** Anvil damage */ - 20 /** Gaslight */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Skizz "Gas Light" twice against Pearl "Aussie Ping" (1 of 2)', async () => {
		await testGame(
			{
				playerOneDeck: [RendogRare, BadOmen, Anvil],
				playerTwoDeck: [
					ZombieCleoRare,
					GrianchRare,
					PearlescentMoonRare,
					SkizzlemanRare,
					BadOmen,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(RendogRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 2)
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PearlescentMoonRare, 'hermit', 1)
					await test.playCardFromHand(SkizzlemanRare, 'hermit', 3)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					await test.finishModalRequest({pick: 'secondary'})
					// Have Aussie Ping flip tails then heads
					game.components
						.find(
							StatusEffectComponent,
							query.effect.is(BadOmenEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						)
						?.remove()
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						ZombieCleoRare.health -
							GrianchRare.secondary.damage -
							30 /* Anvil damage */ -
							SkizzlemanRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(3),
						)?.health,
					).toBe(
						SkizzlemanRare.health - 10 /** Anvil damage */ - 20 /** Gaslight */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Skizz "Gas Light" twice against Pearl "Aussie Ping" (2 of 2)', async () => {
		await testGame(
			{
				playerOneDeck: [RendogRare, BadOmen, Anvil],
				playerTwoDeck: [
					ZombieCleoRare,
					GrianchRare,
					PearlescentMoonRare,
					SkizzlemanRare,
					BadOmen,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(RendogRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 2)
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PearlescentMoonRare, 'hermit', 1)
					await test.playCardFromHand(SkizzlemanRare, 'hermit', 3)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					// Have Aussie Ping flip heads then tails
					const badOmenEffect = game.components.find(
						StatusEffectComponent,
						query.effect.is(BadOmenEffect),
						query.effect.targetIsCardAnd(query.card.opponentPlayer),
					)
					badOmenEffect?.remove()
					await test.finishModalRequest({pick: 'secondary'})
					badOmenEffect?.apply(game.opponentPlayer.getActiveHermit()?.entity)
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						ZombieCleoRare.health -
							GrianchRare.secondary.damage -
							30 /* Anvil damage */ -
							SkizzlemanRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(3),
						)?.health,
					).toBe(
						SkizzlemanRare.health - 10 /** Anvil damage */ - 20 /** Gaslight */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Human Cleo "Betrayed" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, Fortune],
				playerTwoDeck: [HumanCleoRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					expect(game.currentPlayer.coinFlips).toHaveLength(1)
					await test.attack('secondary')
					expect(game.currentPlayer.coinFlips).toHaveLength(0)
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health - GrianchRare.secondary.damage,
					)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health - GrianchRare.secondary.damage,
					)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health -
							GrianchRare.secondary.damage -
							GrianchRare.secondary.damage,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Human Cleo "Betrayed" + Evil Xisuma "Derpcoin"', async () => {
		await testGame(
			{
				playerOneDeck: [
					GrianchRare,
					EthosLabCommon,
					BuilderItem,
					PvPDoubleItem,
					Efficiency,
				],
				playerTwoDeck: [
					ZombieCleoRare,
					HumanCleoRare,
					EvilXisumaRare,
					PvPDoubleItem,
					PvPDoubleItem,
					BadOmen,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(BuilderItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(HumanCleoRare, 'hermit', 1)
					await test.playCardFromHand(EvilXisumaRare, 'hermit', 2)
					await test.playCardFromHand(PvPDoubleItem, 'item', 0, 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(PvPDoubleItem, 'item', 0, 1)
					await test.playCardFromHand(Efficiency, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(PvPDoubleItem, 'item', 0, 1)
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.finishModalRequest({pick: 'primary'})
					await test.endTurn()

					expect(game.state.turn.availableActions).toContain(
						'CHANGE_ACTIVE_HERMIT',
					)
					await test.changeActiveHermit(1)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, forceCoinFlip: true},
		)
	})

	test('Using Worm Man "Total Anonymity" twice against "Betrayed"', async () => {
		await testGame(
			{
				playerOneDeck: [RendogRare, BadOmen, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					GrianchRare,
					HumanCleoRare,
					WormManRare,
					BadOmen,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(RendogRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 2)
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(HumanCleoRare, 'hermit', 1)
					await test.playCardFromHand(WormManRare, 'hermit', 3)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.finishModalRequest({pick: 'secondary'})
					// Have Naughty flip tails then Betrayed flip 2 heads
					game.components
						.find(
							StatusEffectComponent,
							query.effect.is(BadOmenEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						)
						?.remove()
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 4)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						ZombieCleoRare.health -
							GrianchRare.secondary.damage -
							WormManRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - WormManRare.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Worm Man "Total Anonymity" + Gem "Geminislay"', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					WormManRare,
					GeminiTayRare,
					BadOmen,
					Anvil,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(WormManRare, 'hermit', 1)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 2)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.playCardFromHand(Anvil, 'single_use')
					expect(
						game.components.find(CardComponent, query.card.is(Anvil))
							?.turnedOver,
					).toBe(false)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Zedaph "Sheep Stare" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, Fortune],
				playerTwoDeck: [ZedaphPlaysRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('primary')
					expect(game.currentPlayer.coinFlips).toHaveLength(1)
					await test.attack('primary')
					expect(game.currentPlayer.coinFlips).toHaveLength(0)
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZedaphPlaysRare.health - GrianchRare.secondary.damage,
					)
					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							(ZedaphPlaysRare.primary.damage +
								WEAKNESS_DAMAGE) /** Explorer -> Builder */ -
							(ZedaphPlaysRare.primary.damage + WEAKNESS_DAMAGE),
					)
					await test.attack('secondary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZedaphPlaysRare.health - GrianchRare.secondary.damage,
					)
					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							(ZedaphPlaysRare.primary.damage + WEAKNESS_DAMAGE) -
							(ZedaphPlaysRare.primary.damage + WEAKNESS_DAMAGE) -
							GrianchRare.secondary.damage,
					)
					await test.attack('secondary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZedaphPlaysRare.health - GrianchRare.secondary.damage,
					)
					expect(game.currentPlayer.activeRow).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Zedaph "Sheep Stare" + Human Cleo "Betrayed"', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					ZedaphPlaysRare,
					HumanCleoRare,
					BadOmen,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 1)
					await test.playCardFromHand(HumanCleoRare, 'hermit', 2)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'primary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							ZedaphPlaysRare.primary.damage -
							HumanCleoRare.secondary.damage,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZombieCleoRare.health - GrianchRare.secondary.damage,
					)
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							ZedaphPlaysRare.primary.damage -
							HumanCleoRare.secondary.damage -
							GrianchRare.secondary.damage,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZombieCleoRare.health - GrianchRare.secondary.damage,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Poultry Man only recycles Egg when used with secondary', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [PoultryManRare, BadOmen, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(PoultryManRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('primary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					await test.endTurn()
					expect(
						game.opponentPlayer.getDiscarded().map((card) => card.props),
					).toContain(Egg)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Gem "Geminislay" and Egg + Poultry Man secondary', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					GeminiTayRare,
					PoultryManRare,
					BadOmen,
					Egg,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 1)
					await test.playCardFromHand(PoultryManRare, 'hermit', 2)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.currentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([Egg])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Hels "Trap Hole" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, Fortune],
				playerTwoDeck: [HelsknightRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(HelsknightRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					expect(
						game.currentPlayer.coinFlips.filter(
							(coinFlip) => coinFlip.opponentFlip,
						),
					).toHaveLength(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using G. Architect "Amnesia" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, Fortune],
				playerTwoDeck: [ArchitectFalseRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ArchitectFalseRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.attack('secondary')
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(SecondaryAttackDisabledEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						).length,
					).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('G. Architect "Amnesia" blocks ALL hermit attacks used last turn', async () => {
		await testGame(
			{
				playerOneDeck: [ArchitectFalseRare, ArchitectFalseRare],
				playerTwoDeck: [GrianchRare, GrianchRare, ChorusFruit],
				testGame: async (test, game) => {
					await test.playCardFromHand(ArchitectFalseRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.attack('secondary')
					await test.attack('primary')
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(PrimaryAttackDisabledEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(SecondaryAttackDisabledEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(ArchitectFalseRare, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(GrianchRare, 'hermit', 1)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(SecondaryAttackDisabledEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.afk,
							),
						),
					).not.toBe(null)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(SecondaryAttackDisabledEffect),
							query.effect.targetIsCardAnd(
								query.card.opponentPlayer,
								query.card.active,
							),
						),
					).not.toBe(null)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Gem "Geminislay" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [GeminiTayRare, BadOmen, ...Array(3).fill(Anvil)],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GeminiTayRare.health -
							GrianchRare.secondary.damage -
							WEAKNESS_DAMAGE /** Builder -> Terraform */,
					)
					await test.endTurn()

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('single-use')
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Beetlejhost "Jopacity" twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare],
				playerTwoDeck: [BeetlejhostRare, BadOmen, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							BeetlejhostRare.secondary.damage -
							(BeetlejhostRare.secondary.damage - 10),
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						)?.counter,
					).toBe(2)
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('single-use')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Beetlejhost "Jopactity" + Cleo primary', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, BeetlejhostRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(BeetlejhostRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(
						game.currentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
					await test.attack('primary')
					expect(
						game.currentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect),
					).toBe(null)
					await test.endTurn()

					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							BeetlejhostRare.secondary.damage -
							ZombieCleoRare.primary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Skizz "Gas Light" + Beetlejhost "Jopactity"', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					SkizzlemanRare,
					BeetlejhostRare,
					BadOmen,
					Anvil,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(SkizzlemanRare, 'hermit', 1)
					await test.playCardFromHand(BeetlejhostRare, 'hermit', 2)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(
						game.currentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
					await test.endTurn()

					expect(
						game.opponentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using D. Impulse + Golden Axe twice', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [DwarfImpulseRare, BadOmen, GoldenAxe],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(DwarfImpulseRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							DwarfImpulseRare.secondary.damage -
							DwarfImpulseRare.secondary.damage,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /** Golden Axe */)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
