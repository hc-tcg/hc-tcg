import {describe, expect, test} from '@jest/globals'
import Cat from 'common/cards/advent-of-tcg/attach/cat'
import ShubbleYTRare from 'common/cards/advent-of-tcg/hermits/shubbleyt-rare'
import {Thorns} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import TerraformItem from 'common/cards/items/terraform-common'
import TerraformDoubleItem from 'common/cards/items/terraform-rare'
import {IronSword} from 'common/cards/single-use/sword'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {testGame} from '../../utils'

describe('Test Shelby Parallel World', () => {
	test('Parallel World Functionality', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				ShubbleYTRare,
				...Array(6).fill(TerraformDoubleItem),
				IronSword,
				...Array(4).fill(TerraformItem),
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(ShubbleYTRare, 'hermit', 0)
				await test.playCardFromHand(TerraformDoubleItem, 'item', 0, 0)
				await test.attack('secondary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(IronSword)
				await test.finishModalRequest({result: true, cards: null})
				expect(
					game.currentPlayer
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.at(-1)?.props,
				).toStrictEqual(IronSword)
				await test.endTurn()
				expect(
					game.opponentPlayer
						.getHand()
						.sort(CardComponent.compareOrder)
						.map((card) => card.props),
				).toStrictEqual([...Array(5).fill(TerraformDoubleItem), TerraformItem])
			},
		})
	})

	test('Parallel World shows correct card when Shelby is knocked-out by Thorns', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				ShubbleYTRare,
				ShubbleYTRare,
				...Array(6).fill(TerraformDoubleItem),
				IronSword,
				...Array(4).fill(TerraformItem),
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(Thorns, 'attach', 0)
				await test.endTurn()

				await test.playCardFromHand(ShubbleYTRare, 'hermit', 0)
				// Manually set Shelby health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				await test.playCardFromHand(ShubbleYTRare, 'hermit', 1)
				await test.playCardFromHand(TerraformDoubleItem, 'item', 0, 0)
				await test.attack('secondary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(IronSword)
				await test.finishModalRequest({result: true, cards: null})
				expect(
					game.currentPlayer
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.at(-1)?.props,
				).toStrictEqual(IronSword)
			},
		})
	})

	test('Parallel World removes modal when Shelby is knocked-out by Thorns and gives away last card as prize', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				ShubbleYTRare,
				ShubbleYTRare,
				...Array(5).fill(TerraformDoubleItem),
				IronSword,
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(Thorns, 'attach', 0)
				await test.endTurn()

				await test.playCardFromHand(ShubbleYTRare, 'hermit', 0)
				// Manually set Shelby health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				await test.playCardFromHand(ShubbleYTRare, 'hermit', 1)
				await test.playCardFromHand(TerraformDoubleItem, 'item', 0, 0)
				expect(
					game.currentPlayer.getDrawPile().map((card) => card.props),
				).toStrictEqual([IronSword])
				await test.attack('secondary')
				expect(game.state.modalRequests).toHaveLength(0)
			},
		})
	})

	test('Parallel World + Cat', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				ShubbleYTRare,
				Cat,
				...Array(5).fill(TerraformDoubleItem),
				IronSword,
				...Array(4).fill(TerraformItem),
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(ShubbleYTRare, 'hermit', 0)
				await test.playCardFromHand(Cat, 'attach', 0)
				await test.playCardFromHand(TerraformDoubleItem, 'item', 0, 0)
				await test.attack('secondary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(IronSword)
				await test.finishModalRequest({result: true, cards: null})
				expect(
					game.currentPlayer
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.at(-1)?.props,
				).toStrictEqual(IronSword)
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(TerraformItem)
				await test.finishModalRequest({result: true, cards: null})
				expect(
					game.currentPlayer
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.at(0)?.props,
				).toStrictEqual(IronSword)
				await test.endTurn()
				expect(
					game.opponentPlayer
						.getHand()
						.sort(CardComponent.compareOrder)
						.map((card) => card.props),
				).toStrictEqual([...Array(4).fill(TerraformDoubleItem), IronSword])
			},
		})
	})
})
