import {describe, expect, test} from '@jest/globals'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import Lantern from 'common/cards/advent-of-tcg/single-use/lantern'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderItem from 'common/cards/items/builder-common'
import MinerItem from 'common/cards/items/miner-common'
import TerraformItem from 'common/cards/items/terraform-common'
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
					...Array(5).fill(Feather),
					BalancedItem,
					BuilderItem,
					MinerItem,
					TerraformItem,
					Feather,
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
					).toStrictEqual([BuilderItem, MinerItem, Feather])
					yield* finishModalRequest(game, {result: false, cards: null})
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false},
		)
	})
})
