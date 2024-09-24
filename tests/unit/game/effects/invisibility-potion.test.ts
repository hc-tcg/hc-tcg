import {describe, expect, test} from '@jest/globals'
import PoePoeSkizzRare from 'common/cards/alter-egos-iii/hermits/poepoeskizz-rare'
import SpookyStressRare from 'common/cards/alter-egos-iii/hermits/spookystress-rare'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'
import WaterBucket from 'common/cards/default/effects/water-bucket'

import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import InvisibilityPotion from 'common/cards/default/single-use/invisibility-potion'
import SkizzlemanRare from 'common/cards/season-x/hermits/skizzleman-rare'
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					// Verify effect lasts for multiple turns.
					yield* endTurn(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					// Verify effect lasts for multiple turns.
					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')

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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, PoePoeSkizzRare, 'hermit', 0)
					yield* attack(game, 'secondary')
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, SpookyStressRare, 'hermit', 0)
					yield* playCardFromHand(game, WaterBucket, 'attach', 0)
					yield* attack(game, 'secondary')

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
