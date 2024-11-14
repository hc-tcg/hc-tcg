import {describe, expect, test} from '@jest/globals'
import RedstoneTorch from 'common/cards/advent-of-tcg/single-use/redstone-torch'
import MinecartWithTNT from 'common/cards/advent-of-tcg/single-use/tnt-minecart'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import TNT from 'common/cards/single-use/tnt'
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

describe('Test Redstone Torch', () => {
	test('Detonate 3 TNT', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					EthosLabCommon,
					RedstoneTorch,
					...Array(4).fill(BalancedItem),
					TNT,
					BalancedItem,
					TNT,
					BalancedItem,
					TNT,
					...Array(3).fill(BalancedItem),
					TNT,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, RedstoneTorch, 'single_use')
					yield* applyEffect(game)
					expect(game.state.modalRequests[0]?.modal).toMatchObject({
						type: 'selectCards',
						selectionSize: 0,
						cancelable: false,
					})
					const deckEntities = game.currentPlayer
						.getDeck()
						.sort(CardComponent.compareOrder)
						.map((card) => card.entity)
					expect(
						(
							game.state.modalRequests[0] as SelectCards.Request
						).modal.cards.map((entity) => deckEntities.indexOf(entity)),
					).toStrictEqual([0, 1, 2, 3, 4, 6, 7])
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 40 * 3,
					)
					expect(
						game.currentPlayer
							.getDiscarded()
							.sort(CardComponent.compareOrder)
							.map((card) => deckEntities.indexOf(card.entity)),
					).toStrictEqual([0, 1, 2, 3, 4, 6, 7])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Detonate 1 TNT Minecart', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					EthosLabCommon,
					RedstoneTorch,
					...Array(4).fill(BalancedItem),
					MinecartWithTNT,
					MinecartWithTNT,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, RedstoneTorch, 'single_use')
					yield* applyEffect(game)
					expect(
						(game.state.modalRequests[0] as SelectCards.Request).modal.cards,
					).toStrictEqual([
						game.components.findEntity(
							CardComponent,
							query.card.currentPlayer,
							query.card.is(MinecartWithTNT),
							query.card.slot(query.slot.deck),
						),
					])
					yield* finishModalRequest(game, {result: true, cards: null})
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Redstone Torch can not be used with 0 cards in deck or opponent has no active Hermit', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					RedstoneTorch,
					...Array(7).fill(BalancedItem),
				],
				playerTwoDeck: [EthosLabCommon, RedstoneTorch],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					expect(game.currentPlayer.getDeck().length).toBe(2)
					expect(
						game.getPickableSlots(RedstoneTorch.attachCondition),
					).toStrictEqual([])
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					expect(game.currentPlayer.getDeck().length).toBe(0)
					expect(
						game.getPickableSlots(RedstoneTorch.attachCondition),
					).toStrictEqual([])
					yield* endTurn(game)

					expect(game.currentPlayer.getDeck().length).toBe(1)
					yield* playCardFromHand(game, RedstoneTorch, 'single_use')
					yield* applyEffect(game)
					expect(
						(game.state.modalRequests[0] as SelectCards.Request).modal.cards,
					).toStrictEqual([])
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})
})
