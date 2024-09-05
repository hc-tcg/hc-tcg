import {describe, expect, test} from '@jest/globals'
import SilkTouch from 'common/cards/alter-egos-iii/effects/silk-touch'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Clock from 'common/cards/default/single-use/clock'
import IronSword from 'common/cards/default/single-use/iron-sword'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {applyEffect, attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Silk Touch', () => {
	test('Test Silk Touch on active hermit.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, SilkTouch, IronSword],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, SilkTouch, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					// Iron sword is immediately drawn from the deck as it is the only card.
					expect(
						game.components.find(
							CardComponent,
							query.card.is(IronSword),
							query.card.opponentPlayer,
						)?.slot.type,
					).toBe('hand')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.is(SilkTouch),
						)?.slot.type,
					).toBe('discardPile')
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Silk Touch on active hermit can not recover Clock.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, SilkTouch, Clock],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, SilkTouch, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Clock, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(Clock),
							query.card.opponentPlayer,
						)?.slot.type,
					).toBe('discardPile')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.is(SilkTouch),
						)?.slot.type,
					).toBe('attach')
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Silk Touch on inactive hermit.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, SilkTouch, IronSword],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, SilkTouch, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(IronSword),
							query.card.opponentPlayer,
						)?.slot.type,
					).toBe('discardPile')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.is(SilkTouch),
						)?.slot.type,
					).toBe('attach')
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
