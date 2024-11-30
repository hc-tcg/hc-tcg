import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderItem from 'common/cards/items/builder-common'
import MinerItem from 'common/cards/items/miner-common'
import {CardComponent} from 'common/components'
import {SelectCards} from 'common/types/modal-requests'
import {
	applyEffect,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Brush Single Use', () => {
	test('Leaving all 3 cards on top', () => {
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
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as SelectCards.Data
					).cards
					yield* finishModalRequest(game, {
						result: true,
						cards: [cardEntities[1], cardEntities[2], cardEntities[0]],
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

	test('Moving all 3 cards to bottom', () => {
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
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem])
					yield* finishModalRequest(game, {
						result: true,
						cards: null,
					})
					expect(
						game.currentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([Feather, BalancedItem, BuilderItem, MinerItem])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Moving 2 cards to bottom and leaving 1 on top', () => {
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
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as SelectCards.Data
					).cards
					yield* finishModalRequest(game, {
						result: true,
						cards: [cardEntities[0]],
					})
					expect(
						game.currentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BalancedItem, Feather, BuilderItem, MinerItem])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Moving 1 card to bottom and leaving 2 on top', () => {
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
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as SelectCards.Data
					).cards
					yield* finishModalRequest(game, {
						result: true,
						cards: [cardEntities[0], cardEntities[2]],
					})
					expect(
						game.currentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BalancedItem, MinerItem, Feather, BuilderItem])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})
})
