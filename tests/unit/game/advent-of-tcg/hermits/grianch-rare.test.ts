import {describe, expect, test} from '@jest/globals'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import BoomerBdubsRare from 'common/cards/alter-egos-ii/hermits/boomerbdubs-rare'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'
import Totem from 'common/cards/default/effects/totem'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/default/hermits/geminitay-rare'
import PearlescentMoonRare from 'common/cards/default/hermits/pearlescentmoon-rare'
import RendogRare from 'common/cards/default/hermits/rendog-rare'
import ZombieCleoRare from 'common/cards/default/hermits/zombiecleo-rare'
import Fortune from 'common/cards/default/single-use/fortune'
import InvisibilityPotion from 'common/cards/default/single-use/invisibility-potion'
import SkizzlemanRare from 'common/cards/season-x/hermits/skizzleman-rare'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {WEAKNESS_DAMAGE} from 'common/const/damage'
import BadOmenEffect from 'common/status-effects/badomen'
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
})
