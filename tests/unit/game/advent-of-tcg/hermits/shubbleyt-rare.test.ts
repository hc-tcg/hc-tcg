import {describe, expect, test} from '@jest/globals'
import Cat from 'common/cards/advent-of-tcg/attach/cat'
import ShubbleYTRare from 'common/cards/advent-of-tcg/hermits/shubbleyt-rare'
import Thorns from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import TerraformItem from 'common/cards/items/terraform-common'
import TerraformDoubleItem from 'common/cards/items/terraform-rare'
import IronSword from 'common/cards/single-use/iron-sword'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {
	attack,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Shelby Parallel World', () => {
	test('Parallel World Functionality', () => {
		testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				ShubbleYTRare,
				...Array(6).fill(TerraformDoubleItem),
				IronSword,
				...Array(4).fill(TerraformItem),
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, ShubbleYTRare, 'hermit', 0)
				yield* playCardFromHand(game, TerraformDoubleItem, 'item', 0, 0)
				yield* attack(game, 'secondary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(IronSword)
				yield* finishModalRequest(game, {result: true, cards: null})
				expect(
					game.currentPlayer.getDeck().sort(CardComponent.compareOrder).at(-1)
						?.props,
				).toStrictEqual(IronSword)
				yield* endTurn(game)
				expect(
					game.opponentPlayer
						.getHand()
						.sort(CardComponent.compareOrder)
						.map((card) => card.props),
				).toStrictEqual([...Array(5).fill(TerraformDoubleItem), TerraformItem])
			},
		})
	})

	test('Parallel World shows correct card when Shelby is knocked-out by Thorns', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				ShubbleYTRare,
				ShubbleYTRare,
				...Array(6).fill(TerraformDoubleItem),
				IronSword,
				...Array(4).fill(TerraformItem),
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, Thorns, 'attach', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, ShubbleYTRare, 'hermit', 0)
				// Manually set Shelby health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				yield* playCardFromHand(game, ShubbleYTRare, 'hermit', 1)
				yield* playCardFromHand(game, TerraformDoubleItem, 'item', 0, 0)
				yield* attack(game, 'secondary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(IronSword)
				yield* finishModalRequest(game, {result: true, cards: null})
				expect(
					game.currentPlayer.getDeck().sort(CardComponent.compareOrder).at(-1)
						?.props,
				).toStrictEqual(IronSword)
			},
		})
	})

	test('Parallel World removes modal when Shelby is knocked-out by Thorns and gives away last card as prize', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				ShubbleYTRare,
				ShubbleYTRare,
				...Array(5).fill(TerraformDoubleItem),
				IronSword,
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, Thorns, 'attach', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, ShubbleYTRare, 'hermit', 0)
				// Manually set Shelby health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				yield* playCardFromHand(game, ShubbleYTRare, 'hermit', 1)
				yield* playCardFromHand(game, TerraformDoubleItem, 'item', 0, 0)
				expect(
					game.currentPlayer.getDeck().map((card) => card.props),
				).toStrictEqual([IronSword])
				yield* attack(game, 'secondary')
				expect(game.state.modalRequests).toHaveLength(0)
			},
		})
	})

	test('Parallel World + Cat', () => {
		testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				ShubbleYTRare,
				Cat,
				...Array(5).fill(TerraformDoubleItem),
				IronSword,
				...Array(4).fill(TerraformItem),
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, ShubbleYTRare, 'hermit', 0)
				yield* playCardFromHand(game, Cat, 'attach', 0)
				yield* playCardFromHand(game, TerraformDoubleItem, 'item', 0, 0)
				yield* attack(game, 'secondary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(IronSword)
				yield* finishModalRequest(game, {result: true, cards: null})
				expect(
					game.currentPlayer.getDeck().sort(CardComponent.compareOrder).at(-1)
						?.props,
				).toStrictEqual(IronSword)
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(TerraformItem)
				yield* finishModalRequest(game, {result: true, cards: null})
				expect(
					game.currentPlayer.getDeck().sort(CardComponent.compareOrder).at(0)
						?.props,
				).toStrictEqual(IronSword)
				yield* endTurn(game)
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
