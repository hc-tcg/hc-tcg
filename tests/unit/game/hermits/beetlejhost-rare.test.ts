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
import {testGame} from '../utils'

describe('Test Beetlejhost Rare', () => {
	test('Test Jopacity damage is reduced', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BeetlejhostRare.secondary.damage)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - (BeetlejhostRare.secondary.damage - 10),
					)
					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

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
	test('Attacking with primary removes Chroma Keyed', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).not.toBe(null)

					await test.endTurn()
					await test.endTurn()

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
	test('Attacking with other hermit removes Chroma Keyed', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare, GeminiTayCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

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

					await test.endTurn()
					await test.endTurn()

					await test.changeActiveHermit(1)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).not.toBe(null)

					await test.endTurn()
					await test.endTurn()

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
	test('Chroma Keyed is removed when doing nothing', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')

					await test.endTurn()
					await test.endTurn()

					// Do nothing for a turn.
					await test.endTurn()
					await test.endTurn()

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
	test('Test Jopacity with Invisibility tails', async () => {
		await testGame(
			{
				playerOneDeck: [GeminiTayCommon, InvisibilityPotion],
				playerTwoDeck: [BeetlejhostRare, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()

					await test.attack('secondary')

					expect(game.opponentPlayer.activeRow?.health).toBe(
						GeminiTayCommon.health - BeetlejhostRare.secondary.damage,
					)

					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()

					await test.endTurn()

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
	test('Chroma Keyed is not removed by single use damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare, EnderPearl, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BeetlejhostRare.secondary.damage)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - (BeetlejhostRare.secondary.damage - 10),
					)
					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

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
	test('Chroma Keyed is not removed by weakness damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BeetlejhostRare, PotionOfWeakness, PotionOfWeakness],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

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
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

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
	test('Jopacity reduction is not shared between hermits', async () => {
		await testGame(
			{
				playerOneDeck: [BeetlejhostRare, Knockback],
				playerTwoDeck: [BeetlejhostRare, BeetlejhostRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(BeetlejhostRare, 'hermit', 0)
					await test.playCardFromHand(BeetlejhostRare, 'hermit', 1)
					await test.attack('secondary')
					await test.endTurn()
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						BeetlejhostRare.health - BeetlejhostRare.secondary.damage,
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						BeetlejhostRare.health -
							BeetlejhostRare.secondary.damage -
							BeetlejhostRare.secondary.damage,
					)
					await test.endTurn()
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
