import {describe, expect, test} from '@jest/globals'
import FletchingTable from 'common/cards/advent-of-tcg/single-use/fletching-table'
import Lantern from 'common/cards/advent-of-tcg/single-use/lantern'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import BalancedItem from 'common/cards/default/items/balanced-common'
import BuilderItem from 'common/cards/default/items/builder-common'
import MinerItem from 'common/cards/default/items/miner-common'
import TerraformItem from 'common/cards/default/items/terraform-common'
import {CardComponent} from 'common/components'
import {SelectCards} from 'common/types/modal-requests'
import {
	applyEffect,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Lantern Single Use', () => {
	test('Lantern functionality', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Lantern,
					...Array(5).fill(FletchingTable),
					BalancedItem,
					BuilderItem,
					MinerItem,
					TerraformItem,
					FletchingTable,
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Lantern, 'single_use')
					yield* applyEffect(game)
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem, TerraformItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as SelectCards.Data
					).cards
					yield* finishModalRequest(game, {
						result: true,
						cards: [cardEntities[0], cardEntities[3]],
					})
					expect(
						game.currentPlayer
							.getHand()
							.sort(CardComponent.compareOrder)
							.slice(-2)
							.map((card) => card.props),
					).toStrictEqual([BalancedItem, TerraformItem])
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([BalancedItem, TerraformItem])
					expect(
						game.currentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BuilderItem, MinerItem, FletchingTable])
					yield* finishModalRequest(game, {result: false, cards: null})
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})
})
