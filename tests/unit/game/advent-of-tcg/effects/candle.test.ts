import {describe, expect, test} from '@jest/globals'
import Candle from 'common/cards/advent-of-tcg/single-use/candle'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {
	applyEffect,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Candle Single Use', () => {
	test('Candle functionality', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Candle,
					...Array(7).fill(BalancedItem),
					EthosLabCommon,
					Candle,
					EthosLabCommon,
				],
				playerTwoDeck: [EthosLabCommon, Candle, ...Array(6).fill(BalancedItem)],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Candle, 'single_use')
					yield* applyEffect(game)
					const cardEntities = (
						game.state.modalRequests[0] as SelectCards.Request
					).modal.cards
					expect(
						cardEntities.map((entity) => game.components.get(entity)?.props),
					).toStrictEqual([BalancedItem, EthosLabCommon])
					yield* finishModalRequest(game, {
						result: true,
						cards: [cardEntities[0]],
					})
					expect(
						game.components.filter(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hand),
							query.card.is(BalancedItem),
						).length,
					).toBe(6)
					expect(
						game.components.filter(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
							query.card.is(BalancedItem),
						).length,
					).toBe(1)
					yield* endTurn(game)

					expect(game.getPickableSlots(Candle.attachCondition)).toStrictEqual(
						[],
					)
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Selecting a card with more than 2 copies', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Candle,
					...Array(10).fill(BalancedItem),
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Candle, 'single_use')
					yield* applyEffect(game)
					expect(
						game.components.filter(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hand),
							query.card.is(BalancedItem),
						).length,
					).toBe(5)
					const cardEntities = (
						game.state.modalRequests[0] as SelectCards.Request
					).modal.cards
					expect(
						cardEntities.map((entity) => game.components.get(entity)?.props),
					).toStrictEqual([BalancedItem])
					yield* finishModalRequest(game, {
						result: true,
						cards: [cardEntities[0]],
					})
					expect(
						game.components.filter(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hand),
							query.card.is(BalancedItem),
						).length,
					).toBe(6)
					expect(
						game.components.filter(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
							query.card.is(BalancedItem),
						).length,
					).toBe(1)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})

	test('If deck has only unique cards, only shuffle', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Candle,
					...Array(6).fill(BalancedItem),
					EthosLabCommon,
					Candle,
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Candle, 'single_use')
					yield* applyEffect(game)
					expect(game.state.modalRequests[0]?.modal).toMatchObject({
						type: 'selectCards',
						selectionSize: 0,
						primaryButton: null,
					})
					expect(
						(game.state.modalRequests[0] as SelectCards.Request).modal.cards,
					).toStrictEqual([])
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(
						game.currentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([...Array(5).fill(BalancedItem)])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})
})
