import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import FletchingTable from 'common/cards/advent-of-tcg/single-use/fletching-table'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import BalancedItem from 'common/cards/default/items/balanced-common'
import BuilderItem from 'common/cards/default/items/builder-common'
import MinerItem from 'common/cards/default/items/miner-common'
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
					...Array(5).fill(FletchingTable),
					BalancedItem,
					BuilderItem,
					MinerItem,
					FletchingTable,
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
					).toStrictEqual([
						BalancedItem,
						BuilderItem,
						MinerItem,
						FletchingTable,
					])
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
					...Array(5).fill(FletchingTable),
					BalancedItem,
					BuilderItem,
					MinerItem,
					FletchingTable,
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
					).toStrictEqual([
						FletchingTable,
						BalancedItem,
						BuilderItem,
						MinerItem,
					])
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
					...Array(5).fill(FletchingTable),
					BalancedItem,
					BuilderItem,
					MinerItem,
					FletchingTable,
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
					).toStrictEqual([
						BalancedItem,
						FletchingTable,
						BuilderItem,
						MinerItem,
					])
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
					...Array(5).fill(FletchingTable),
					BalancedItem,
					BuilderItem,
					MinerItem,
					FletchingTable,
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
					).toStrictEqual([
						BalancedItem,
						MinerItem,
						FletchingTable,
						BuilderItem,
					])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})
})
