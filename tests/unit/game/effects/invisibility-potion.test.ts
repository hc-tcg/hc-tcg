import {describe, expect, test} from '@jest/globals'
import WaterBucket from 'common/cards/attach/water-bucket'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import SpookyStressRare from 'common/cards/hermits/spookystress-rare'
import Anvil from 'common/cards/single-use/anvil'
import BadOmen from 'common/cards/single-use/bad-omen'

import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SkizzlemanRare from 'common/cards/hermits/skizzleman-rare'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {InvisibilityPotionHeadsEffect} from 'common/status-effects/invisibility-potion'
import {testGame} from '../utils'

describe('Test Invisiblity Potion.', () => {
	test('Invisibility Potion blocks damage on heads.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

					// Verify effect lasts for multiple turns.
					await test.endTurn()
					await test.endTurn()

					await test.attack('secondary')

					// Invisibility potion should block damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)

					await test.endTurn()

					// Verify effect timed out.
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(InvisibilityPotionHeadsEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Invisibility Potion doubles damage on tails.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					// Verify effect lasts for multiple turns.
					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')

					// Invisibility potion should double incoming damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.secondary.damage * 2)

					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(InvisibilityPotionHeadsEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Invisibility Potion blocks Skizzleman Rare damage on heads.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					// Invisibility potion should block both of Skizzlman's attacks.
					expect(
						game.components.find(
							RowComponent,
							query.row.index(0),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 30 /* Anvil */)
					await test.endTurn()
					expect(
						game.components.find(
							RowComponent,
							query.row.index(1),
							query.row.currentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 10 /* Anvil only */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Invisibility Potion blocks Poe Poe Skizz Rare damage on heads.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [PoePoeSkizzRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)
					await test.attack('secondary')
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)

					// Invisibility potion should block both of Poe Poe Skizz's attacks.
					expect(
						game.components.find(
							RowComponent,
							query.row.index(0),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.index(1),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Invisibility Potion blocks Spooky Stress damage on heads.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SpookyStressRare, WaterBucket],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(SpookyStressRare, 'hermit', 0)
					await test.playCardFromHand(WaterBucket, 'attach', 0)
					await test.attack('secondary')

					// Invisibility potion should block all damage because it was all created by Spooky Stress.
					expect(
						game.components.find(
							RowComponent,
							query.row.index(0),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.index(1),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
