import {describe, expect, test} from '@jest/globals'
import BeetlejhostRare from 'common/cards/alter-egos-iii/hermits/beetlejhost-rare'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/default/hermits/geminitay-common'
import InvisibilityPotion from 'common/cards/default/single-use/invisibility-potion'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import ChromaKeyedEffect from 'common/status-effects/chroma-keyed'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testGame,
} from './utils'

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
	test('Chroma Keyed is not removed when doing nothing', () => {
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

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ChromaKeyedEffect),
							query.effect.targetEntity(null),
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
})
