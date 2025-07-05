import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderItem from 'common/cards/items/builder-common'
import MinerItem from 'common/cards/items/miner-common'
import {CardComponent} from 'common/components'
import {DragCards} from 'common/types/modal-requests'
import {testGame} from '../../utils'

describe('Test Brush Single Use', () => {
	test('Leaving both cards on top', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Brush, 'single_use')
					await test.applyEffect()
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
					await test.finishModalRequest({
						result: true,
						leftCards: [],
						rightCards: [cardEntities[0], cardEntities[1]],
					})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem, Feather])
					await test.endTurn()
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Moving both cards to bottom', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Brush, 'single_use')
					await test.applyEffect()
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
					await test.finishModalRequest({
						result: true,
						leftCards: [cardEntities[0], cardEntities[1]],
						rightCards: [],
					})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([MinerItem, Feather, BalancedItem, BuilderItem])
					await test.endTurn()
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Moving 1 card to bottom and leaving 1 on top', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Brush, 'single_use')
					await test.applyEffect()
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
					await test.finishModalRequest({
						result: true,
						leftCards: [cardEntities[0]],
						rightCards: [cardEntities[1]],
					})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BuilderItem, MinerItem, Feather, BalancedItem])
					await test.endTurn()
				},
			},
			{startWithAllCards: false},
		)
	})
})
