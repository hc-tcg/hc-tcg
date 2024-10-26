import {describe, expect, test} from '@jest/globals'
import Cat from 'common/cards/advent-of-tcg/effects/cat'
import Thorns from 'common/cards/effects/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GrianRare from 'common/cards/hermits/grian-rare'
import OriginalXBRare from 'common/cards/hermits/originalxb-rare'
import TinFoilChefRare from 'common/cards/hermits/tinfoilchef-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import MinerItem from 'common/cards/items/miner-common'
import MinerDoubleItem from 'common/cards/items/miner-rare'
import IronSword from 'common/cards/single-use/iron-sword'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Cat Effect Card', () => {
	test('Basic functionality', () => {
		testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				EthosLabCommon,
				Cat,
				...Array(7).fill(BalancedItem),
				IronSword,
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, Cat, 'attach', 0)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				yield* attack(game, 'primary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(BalancedItem)
				yield* finishModalRequest(game, {result: true, cards: null})
				expect(
					game.currentPlayer.getDeck().sort(CardComponent.compareOrder).at(0)
						?.props,
				).toStrictEqual(IronSword)
				yield* endTurn(game)

				yield* endTurn(game)

				yield* playCardFromHand(game, IronSword, 'single_use')
				yield* attack(game, 'single-use')
				expect(game.state.modalRequests).toHaveLength(0)
			},
		})
	})

	test('Cat shows correct card when attacker is knocked-out by Thorns', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				EthosLabCommon,
				EthosLabCommon,
				Cat,
				...Array(5).fill(BalancedItem),
				IronSword,
				...Array(4).fill(BalancedDoubleItem),
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, Thorns, 'attach', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				// Manually set Etho health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, Cat, 'attach', 0)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				yield* attack(game, 'primary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(IronSword)
				yield* finishModalRequest(game, {result: true, cards: null})
				expect(
					game.currentPlayer.getDeck().sort(CardComponent.compareOrder).at(0)
						?.props,
				).toStrictEqual(BalancedDoubleItem)
				yield* changeActiveHermit(game, 1)
				yield* endTurn(game)

				expect(
					game.opponentPlayer.getHand().sort(CardComponent.compareOrder).at(-1)
						?.props,
				).toBe(BalancedDoubleItem)
			},
		})
	})

	test('Cat removes modal when attacker is knocked-out by Thorns and gives away last card as prize', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				EthosLabCommon,
				EthosLabCommon,
				Cat,
				...Array(4).fill(BalancedItem),
				IronSword,
			],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, Thorns, 'attach', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				// Manually set Etho health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				yield* playCardFromHand(game, Cat, 'attach', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				expect(
					game.currentPlayer.getDeck().map((card) => card.props),
				).toStrictEqual([IronSword])
				yield* attack(game, 'primary')
				expect(game.state.modalRequests).toHaveLength(0)
			},
		})
	})

	test("Cat + TFC's Branch Mine and Original xB's Get Good", () => {
		testGame(
			{
				playerOneDeck: [OriginalXBRare, MinerDoubleItem, MinerItem],
				playerTwoDeck: [
					TinFoilChefRare,
					Cat,
					MinerDoubleItem,
					...Array(5).fill(MinerItem),
					Cat,
					Thorns,
					MinerItem,
					IronSword,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, OriginalXBRare, 'hermit', 0)
					yield* playCardFromHand(game, MinerDoubleItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefRare, 'hermit', 0)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* playCardFromHand(game, MinerDoubleItem, 'item', 0, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, MinerItem, 'item', 0, 1)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(
						game.components.get(
							(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
						)?.props,
					).toStrictEqual(Cat)
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* endTurn(game)

					expect(
						game.opponentPlayer
							.getHand()
							.sort(CardComponent.compareOrder)
							.slice(-3)
							.map((card) => card.props),
					).toStrictEqual([IronSword, Cat, Thorns])
				},
			},
			{forceCoinFlip: true},
		)
	})

	test('Test Borrow does not trigger Cat when attached after flipping heads', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Cat, Cat],
				playerTwoDeck: [GrianRare, ...Array(10).fill(BalancedItem)],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* attack(game, 'primary')
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Cat),
							query.card.currentPlayer,
							query.card.active,
						),
					).not.toBe(null)
					yield* endTurn(game)

					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					expect(game.state.modalRequests).toHaveLength(2)
					yield* finishModalRequest(game, {result: false, cards: null})
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* endTurn(game)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
