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
import {testGame} from '../../utils'

describe('Test Lantern Single Use', () => {
	test('Lantern functionality', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Lantern, 'single_use')
					await test.applyEffect()
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([BalancedItem, BuilderItem, MinerItem, TerraformItem])
					const cardEntities = (
						game.state.modalRequests[0].modal as SelectCards.Data
					).cards
					await test.finishModalRequest({
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
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([BuilderItem, MinerItem, Feather])
					await test.finishModalRequest({result: false, cards: null})
					await test.endTurn()
				},
			},
			{startWithAllCards: false},
		)
	})
})
