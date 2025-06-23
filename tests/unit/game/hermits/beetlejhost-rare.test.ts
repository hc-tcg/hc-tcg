import {describe, expect, test} from '@jest/globals'
import BeetlejhostRare from 'common/cards/hermits/beetlejhost-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import Knockback from 'common/cards/single-use/knockback'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import {IronSword} from 'common/cards/single-use/sword'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {WEAKNESS_DAMAGE} from 'common/const/damage'
import ChromaKeyedEffect from 'common/status-effects/chroma-keyed'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Beetlejhost Rare', () => {
	test('Test Jopacity damage is reduced', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BeetlejhostRare.secondary.damage)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - (BeetlejhostRare.secondary.damage - 10),
					)
					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						EthosLabCommon.health - (BeetlejhostRare.secondary.damage - 20),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Attacking with primary removes Chroma Keyed', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).not.toBe(null)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Attacking with other hermit removes Chroma Keyed', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare, GeminiTayCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 1)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).not.toBe(null)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).not.toBe(null)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Chroma Keyed is removed when doing nothing', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					yield* endTurn(game)
					yield* endTurn(game)

					// Do nothing for a turn.
					yield* endTurn(game)
					yield* endTurn(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Jopacity with Invisibility tails', () => {
		testGame(
			{
				playerOneDeck: [GeminiTayCommon, InvisibilityPotion],
				playerTwoDeck: [BeetlejhostRare, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)

					yield* attack(game, 'secondary')

					expect(game.opponentPlayer.activeRow?.health).toBe(
						GeminiTayCommon.health - BeetlejhostRare.secondary.damage,
					)

					yield* endTurn(game)

					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					expect(game.opponentPlayer.activeRow?.health).toBe(
						GeminiTayCommon.health -
							BeetlejhostRare.secondary.damage -
							(BeetlejhostRare.secondary.damage - 10) * 2,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Chroma Keyed is not removed by single use damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare, EnderPearl, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BeetlejhostRare.secondary.damage)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - (BeetlejhostRare.secondary.damage - 10),
					)
					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(BeetlejhostRare.secondary.damage - 20) -
							20 /** Iron Sword */,
					)
					expect(
						game.opponentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(3)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Chroma Keyed is not removed by weakness damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare, PotionOfWeakness, PotionOfWeakness],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							BeetlejhostRare.secondary.damage -
							WEAKNESS_DAMAGE,
					)
					expect(
						game.opponentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(BeetlejhostRare.secondary.damage - 10) -
							WEAKNESS_DAMAGE,
					)
					expect(
						game.opponentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(2)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Jopacity reduction is not shared between hermits', () => {
		testGame(
			{
				playerOneDeck: [BeetlejhostRare, Knockback],
				playerTwoDeck: [BeetlejhostRare, BeetlejhostRare],
				saga: function* (game) {
					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 1)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						BeetlejhostRare.health - BeetlejhostRare.secondary.damage,
					)
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						BeetlejhostRare.health -
							BeetlejhostRare.secondary.damage -
							BeetlejhostRare.secondary.damage,
					)
					yield* endTurn(game)

					expect(
						game.opponentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
					expect(
						game.currentPlayer
							.getActiveHermit()
							?.getStatusEffect(ChromaKeyedEffect)?.counter,
					).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
