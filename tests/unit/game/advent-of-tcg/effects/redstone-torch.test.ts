import {describe, expect, test} from '@jest/globals'
import RedstoneTorch from 'common/cards/advent-of-tcg/single-use/redstone-torch'
import MinecartWithTNT from 'common/cards/advent-of-tcg/single-use/tnt-minecart'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import TNT from 'common/cards/single-use/tnt'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {testGame} from '../../utils'

describe('Test Redstone Torch', () => {
	test('Detonate 3 TNT', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(RedstoneTorch, 'single_use')
					await test.applyEffect()
					expect(game.state.modalRequests[0]?.modal).toMatchObject({
						type: 'selectCards',
						selectionSize: 0,
						cancelable: false,
					})
					const deckEntities = game.currentPlayer
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.map((card) => card.entity)
					expect(
						(
							game.state.modalRequests[0] as SelectCards.Request
						).modal.cards.map((entity) => deckEntities.indexOf(entity)),
					).toStrictEqual([0, 1, 2, 3, 4, 6, 7])
					await test.finishModalRequest({result: true, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 40 * 3,
					)
					expect(
						game.currentPlayer
							.getDiscarded()
							.sort(CardComponent.compareOrder)
							.map((card) => deckEntities.indexOf(card.entity)),
					).toStrictEqual([0, 1, 2, 3, 4, 6, 7])
					await test.endTurn()
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Detonate 1 TNT Minecart', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					EthosLabCommon,
					RedstoneTorch,
					...Array(4).fill(BalancedItem),
					MinecartWithTNT,
					MinecartWithTNT,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(RedstoneTorch, 'single_use')
					await test.applyEffect()
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
					await test.finishModalRequest({result: true, cards: null})
				},
			},
			{startWithAllCards: false},
		)
	})

	test('Redstone Torch can not be used with 0 cards in deck or opponent has no active Hermit', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					RedstoneTorch,
					...Array(7).fill(BalancedItem),
				],
				playerTwoDeck: [EthosLabCommon, RedstoneTorch],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					expect(game.currentPlayer.getDrawPile().length).toBe(2)
					expect(
						game.getPickableSlots(RedstoneTorch.attachCondition),
					).toStrictEqual([])
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					expect(game.currentPlayer.getDrawPile().length).toBe(0)
					expect(
						game.getPickableSlots(RedstoneTorch.attachCondition),
					).toStrictEqual([])
					await test.endTurn()

					expect(game.currentPlayer.getDrawPile().length).toBe(1)
					await test.playCardFromHand(RedstoneTorch, 'single_use')
					await test.applyEffect()
					expect(
						(game.state.modalRequests[0] as SelectCards.Request).modal.cards,
					).toStrictEqual([])
					await test.finishModalRequest({result: true, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: false},
		)
	})
})
