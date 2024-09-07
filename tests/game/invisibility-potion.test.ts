import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {applyEffect, attack, endTurn, playCardFromHand, testGame} from './utils'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import InvisibilityPotion from 'common/cards/default/single-use/invisibility-potion'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'

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
					yield* attack(game, 'secondary')

					// Invisibility potion should block damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)
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
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
