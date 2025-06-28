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
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Invisiblity Potion.', () => {
	test('Invisibility Potion blocks damage on heads.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [EthosLabCommon],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

					// Verify effect lasts for multiple turns.
					yield* endTurn(game)
					yield* endTurn(game)

					await test.attack('secondary')

					// Invisibility potion should block damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)

					yield* endTurn(game)

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
	test('Invisibility Potion doubles damage on tails.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					// Verify effect lasts for multiple turns.
					yield* endTurn(game)
					yield* endTurn(game)

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.attack('secondary')

					// Invisibility potion should double incoming damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.secondary.damage * 2)

					yield* endTurn(game)

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
	test('Invisibility Potion blocks Skizzleman Rare damage on heads.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

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
					yield* endTurn(game)
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
	test('Invisibility Potion blocks Poe Poe Skizz Rare damage on heads.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [PoePoeSkizzRare],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)
					await test.attack('secondary')
					yield* pick(
						game,
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
	test('Invisibility Potion blocks Spooky Stress damage on heads.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, InvisibilityPotion],
				playerTwoDeck: [SpookyStressRare, WaterBucket],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

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
