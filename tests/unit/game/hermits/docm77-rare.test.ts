import {describe, expect, test} from '@jest/globals'
import Docm77Rare from 'common/cards/hermits/docm77-rare'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import BadOmenEffect from 'common/status-effects/badomen'
import {InvisibilityPotionTailsEffect} from 'common/status-effects/invisibility-potion'
import {
	applyEffect,
	attack,
	endTurn,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Docm77 World Eater', () => {
	test('Test World Eater with Invisibility (both tails)', () => {
		testGame(
			{
				playerOneDeck: [GeminiTayRare, BadOmen, InvisibilityPotion],
				playerTwoDeck: [Docm77Rare, BadOmen],
				saga: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)

					yield* endTurn(game)

					await test.playCardFromHand(Docm77Rare, 'hermit', 0)

					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)

					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)

					await test.attack('secondary')

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					// Ensure Invilibility flipped tails to double damage
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(InvisibilityPotionTailsEffect),
							query.effect.targetIsPlayerAnd(query.player.currentPlayer),
						),
					).toBeTruthy()

					yield* endTurn(game)

					// Ensure World Eater will flip tails to halve damage
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(BadOmenEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBeTruthy()

					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(GeminiTayRare.health - 80 /* Base World Eater damage */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
