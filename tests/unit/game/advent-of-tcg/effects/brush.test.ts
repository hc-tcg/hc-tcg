import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderItem from 'common/cards/items/builder-common'
import MinerItem from 'common/cards/items/miner-common'
import {CardComponent} from 'common/components'
import {DragCards} from 'common/types/modal-requests'
import {
	applyEffect,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Brush Single Use', () => {
	test('Leaving both cards on top', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Brush,
					...Array(5).fill(Feather),
					BalancedItem,
					BuilderItem,
					MinerItem,
					Feather,
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Brush, 'single_use')
					yield* applyEffect(game)
					expect(
						(game.state.modalRequests[0].modal as DragCards.Data).leftCards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([])
					expect(
						(
							game.state.modalRequests[0].modal as DragCards.Data
						).rightCards.map((entity) => game.components.get(entity)?.props),
					).toStrictEqual([BalancedItem, BuilderItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as DragCards.Data
					).rightCards
					yield* finishModalRequest(game, {
						result: true,
						leftCards: [],
						rightCards: [cardEntities[0], cardEntities[1]],
					})
					expect(
						game.currentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem, Feather])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Moving both cards to bottom', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Brush,
					...Array(5).fill(Feather),
					BalancedItem,
					BuilderItem,
					MinerItem,
					Feather,
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Brush, 'single_use')
					yield* applyEffect(game)
					expect(
						(game.state.modalRequests[0].modal as DragCards.Data).leftCards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([])
					expect(
						(
							game.state.modalRequests[0].modal as DragCards.Data
						).rightCards.map((entity) => game.components.get(entity)?.props),
					).toStrictEqual([BalancedItem, BuilderItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as DragCards.Data
					).rightCards
					yield* finishModalRequest(game, {
						result: true,
						leftCards: [cardEntities[0], cardEntities[1]],
						rightCards: [],
					})
					expect(
						game.currentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([MinerItem, Feather, BalancedItem, BuilderItem])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Moving 1 card to bottom and leaving 1 on top', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Brush,
					...Array(5).fill(Feather),
					BalancedItem,
					BuilderItem,
					MinerItem,
					Feather,
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Brush, 'single_use')
					yield* applyEffect(game)
					expect(
						(game.state.modalRequests[0].modal as DragCards.Data).leftCards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([])
					expect(
						(
							game.state.modalRequests[0].modal as DragCards.Data
						).rightCards.map((entity) => game.components.get(entity)?.props),
					).toStrictEqual([BalancedItem, BuilderItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as DragCards.Data
					).rightCards
					yield* finishModalRequest(game, {
						result: true,
						leftCards: [cardEntities[0]],
						rightCards: [cardEntities[1]],
					})
					expect(
						game.currentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BuilderItem, MinerItem, Feather, BalancedItem])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})
})
