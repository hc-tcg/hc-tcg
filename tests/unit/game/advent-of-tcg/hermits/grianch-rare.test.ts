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

describe('Test The Grianch Naughty', () => {
	test('Fortune only applies to first flip for Naughty per turn', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianchRare, 'hermit', 1)
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 2)
					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Boomer Bdubs "Watch This" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, BadOmen],
				playerTwoDeck: [BoomerBdubsRare, BadOmen, Fortune],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BoomerBdubsRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* attack(game, 'secondary')
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health - (BoomerBdubsRare.secondary.damage + 20),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Pearl "Aussie Ping" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, Fortune],
				playerTwoDeck: [PearlescentMoonRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, PearlescentMoonRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PearlescentMoonRare.health -
							GrianchRare.secondary.damage -
							WEAKNESS_DAMAGE /** Builder -> Terraform */,
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					expect(
						game.currentPlayer.coinFlips.filter(
							(coinFlip) => coinFlip.opponentFlip,
						),
					).toHaveLength(1)
					yield* attack(game, 'secondary')
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
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Invisibility only affects the first attack in a turn', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					InvisibilityPotion,
					InvisibilityPotion,
				],
				playerTwoDeck: [GrianchRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - GrianchRare.secondary.damage,
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - GrianchRare.secondary.damage * 2,
					)
					yield* attack(game, 'secondary')
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

	test('Using Skizz "Gas Light" twice + Totem revive', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, Totem],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Totem, 'attach', 1)
					// Manually set Etho health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(1),
					)!.health = 20
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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

	test('Using Skizz "Gas Light" twice + Invisibility heads', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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

	test('Using Skizz "Gas Light" twice + Invisibility tails', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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

	test('Using Skizz "Gas Light" after Anvil', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [SkizzlemanRare, BadOmen, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'single-use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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

	test('Using Skizz "Gas Light" twice against Pearl "Aussie Ping" (1 of 2)', () => {
		testGame(
			{
				playerOneDeck: [RendogRare, BadOmen, Anvil],
				playerTwoDeck: [
					ZombieCleoRare,
					GrianchRare,
					PearlescentMoonRare,
					SkizzlemanRare,
					BadOmen,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, RendogRare, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 2)
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, PearlescentMoonRare, 'hermit', 1)
					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 3)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					// Have Aussie Ping flip tails then heads
					game.components
						.find(
							StatusEffectComponent,
							query.effect.is(BadOmenEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						)
						?.remove()
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

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

	test('Using Skizz "Gas Light" twice against Pearl "Aussie Ping" (2 of 2)', () => {
		testGame(
			{
				playerOneDeck: [RendogRare, BadOmen, Anvil],
				playerTwoDeck: [
					ZombieCleoRare,
					GrianchRare,
					PearlescentMoonRare,
					SkizzlemanRare,
					BadOmen,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, RendogRare, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 2)
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, PearlescentMoonRare, 'hermit', 1)
					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 3)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					// Use Anvil to trigger Skizz's bonus damage.
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
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
					yield* finishModalRequest(game, {pick: 'secondary'})
					badOmenEffect?.apply(game.opponentPlayer.getActiveHermit()?.entity)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

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

	test('Using Human Cleo "Betrayed" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, Fortune],
				playerTwoDeck: [HumanCleoRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.currentPlayer.coinFlips).toHaveLength(1)
					yield* attack(game, 'secondary')
					expect(game.currentPlayer.coinFlips).toHaveLength(0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health - GrianchRare.secondary.damage,
					)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health - GrianchRare.secondary.damage,
					)
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health -
							GrianchRare.secondary.damage -
							GrianchRare.secondary.damage,
					)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Human Cleo "Betrayed" + Evil Xisuma "Derpcoin"', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, BuilderItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 1)
					yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 2)
					yield* playCardFromHand(game, PvPDoubleItem, 'item', 0, 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, PvPDoubleItem, 'item', 0, 1)
					yield* playCardFromHand(game, Efficiency, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, PvPDoubleItem, 'item', 0, 1)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* finishModalRequest(game, {pick: 'primary'})
					yield* endTurn(game)

					expect(game.state.turn.availableActions).toContain(
						'CHANGE_ACTIVE_HERMIT',
					)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, forceCoinFlip: true},
		)
	})

	test('Using Worm Man "Total Anonymity" twice against "Betrayed"', () => {
		testGame(
			{
				playerOneDeck: [RendogRare, BadOmen, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					GrianchRare,
					HumanCleoRare,
					WormManRare,
					BadOmen,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, RendogRare, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 2)
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 1)
					yield* playCardFromHand(game, WormManRare, 'hermit', 3)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					// Have Naughty flip tails then Betrayed flip 2 heads
					game.components
						.find(
							StatusEffectComponent,
							query.effect.is(BadOmenEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						)
						?.remove()
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(game.state.turn.availableActions).toContain('END_TURN')
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 4)
					yield* endTurn(game)

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

	test('Using Worm Man "Total Anonymity" + Gem "Geminislay"', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					WormManRare,
					GeminiTayRare,
					BadOmen,
					Anvil,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, WormManRare, 'hermit', 1)
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 2)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* playCardFromHand(game, Anvil, 'single_use')
					expect(
						game.components.find(CardComponent, query.card.is(Anvil))
							?.turnedOver,
					).toBe(false)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Zedaph "Sheep Stare" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon, Fortune],
				playerTwoDeck: [ZedaphPlaysRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZedaphPlaysRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'primary')
					expect(game.currentPlayer.coinFlips).toHaveLength(1)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.coinFlips).toHaveLength(0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZedaphPlaysRare.health - GrianchRare.secondary.damage,
					)
					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							(ZedaphPlaysRare.primary.damage +
								WEAKNESS_DAMAGE) /** Explorer -> Builder */ -
							(ZedaphPlaysRare.primary.damage + WEAKNESS_DAMAGE),
					)
					yield* attack(game, 'secondary')
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
					yield* attack(game, 'secondary')
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

	test('Using Zedaph "Sheep Stare" + Human Cleo "Betrayed"', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					ZedaphPlaysRare,
					HumanCleoRare,
					BadOmen,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, ZedaphPlaysRare, 'hermit', 1)
					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 2)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'primary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							ZedaphPlaysRare.primary.damage -
							HumanCleoRare.secondary.damage,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						ZombieCleoRare.health - GrianchRare.secondary.damage,
					)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
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
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Poultry Man only recycles Egg when used with secondary', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [PoultryManRare, BadOmen, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, PoultryManRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					yield* endTurn(game)
					expect(
						game.opponentPlayer.getDiscarded().map((card) => card.props),
					).toContain(Egg)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Gem "Geminislay" and Egg + Poultry Man secondary', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					GeminiTayRare,
					PoultryManRare,
					BadOmen,
					Egg,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 1)
					yield* playCardFromHand(game, PoultryManRare, 'hermit', 2)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* playCardFromHand(game, Egg, 'single_use')
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

	test('Using Hels "Trap Hole" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, Fortune],
				playerTwoDeck: [HelsknightRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, HelsknightRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
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

	test('Using G. Architect "Amnesia" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, Fortune],
				playerTwoDeck: [ArchitectFalseRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ArchitectFalseRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
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

	test('G. Architect "Amnesia" blocks ALL hermit attacks used last turn', () => {
		testGame(
			{
				playerOneDeck: [ArchitectFalseRare, ArchitectFalseRare],
				playerTwoDeck: [GrianchRare, GrianchRare, ChorusFruit],
				saga: function* (game) {
					yield* playCardFromHand(game, ArchitectFalseRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, ArchitectFalseRare, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianchRare, 'hermit', 1)
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Gem "Geminislay" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [GeminiTayRare, BadOmen, ...Array(3).fill(Anvil)],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 1)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GeminiTayRare.health -
							GrianchRare.secondary.damage -
							WEAKNESS_DAMAGE /** Builder -> Terraform */,
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'single-use')
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Beetlejhost "Jopacity" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare],
				playerTwoDeck: [BeetlejhostRare, BadOmen, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 1)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							BeetlejhostRare.secondary.damage -
							(BeetlejhostRare.secondary.damage - 10),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						)?.counter,
					).toBe(2)
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'single-use')
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

	test('Using Beetlejhost "Jopactity" + Cleo primary', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, BeetlejhostRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 1)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(
						game.currentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
					yield* attack(game, 'primary')
					expect(
						game.currentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect),
					).toBe(null)
					yield* endTurn(game)

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

	test('Using Skizz "Gas Light" + Beetlejhost "Jopactity"', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					SkizzlemanRare,
					BeetlejhostRare,
					BadOmen,
					Anvil,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 1)
					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 2)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(
						game.currentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
					yield* endTurn(game)

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

	test('Using D. Impulse + Golden Axe twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [DwarfImpulseRare, BadOmen, GoldenAxe],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, DwarfImpulseRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
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
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
