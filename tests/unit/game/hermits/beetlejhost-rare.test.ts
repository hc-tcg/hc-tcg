import {describe, expect, test} from '@jest/globals'
import BeetlejhostRare from 'common/cards/hermits/beetlejhost-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
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
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')
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

					await test.attack('secondary')
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

					await test.attack('secondary')
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
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).not.toBe(null)

					yield* endTurn(game)
					yield* endTurn(game)

					await test.attack('primary')
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
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 1)
					await test.attack('secondary')

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

					await test.attack('secondary')

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
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')

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
				saga: async (test, game) => {
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)

					yield* endTurn(game)

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)

					await test.attack('secondary')

					expect(game.opponentPlayer.activeRow?.health).toBe(
						GeminiTayCommon.health - BeetlejhostRare.secondary.damage,
					)

					yield* endTurn(game)

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)

					await test.attack('secondary')

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
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')
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

					await test.playCardFromHand(EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
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

					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('secondary')
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
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					await test.attack('secondary')
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

					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					await test.attack('secondary')
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
})
