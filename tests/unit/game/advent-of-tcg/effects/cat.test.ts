import {describe, expect, test} from '@jest/globals'
import Cat from 'common/cards/advent-of-tcg/attach/cat'
import {Thorns} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GrianRare from 'common/cards/hermits/grian-rare'
import OriginalXBRare from 'common/cards/hermits/originalxb-rare'
import TinFoilChefRare from 'common/cards/hermits/tinfoilchef-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import MinerItem from 'common/cards/items/miner-common'
import MinerDoubleItem from 'common/cards/items/miner-rare'
import {IronSword} from 'common/cards/single-use/sword'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {testGame} from '../../utils'

describe('Test Cat Effect Card', () => {
	test('Basic functionality', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [
				EthosLabCommon,
				Cat,
				...Array(7).fill(BalancedItem),
				IronSword,
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(Cat, 'attach', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				await test.attack('primary')
				expect(
					game.components.get(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
					)?.props,
				).toStrictEqual(BalancedItem)
				await test.finishModalRequest({result: true, cards: null})
				expect(
					game.currentPlayer
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.at(0)?.props,
				).toStrictEqual(IronSword)
				await test.endTurn()

				await test.endTurn()

				await test.playCardFromHand(IronSword, 'single_use')
				await test.attack('single-use')
				expect(game.state.modalRequests).toHaveLength(0)
			},
		})
	})

	test('Cat shows correct card when attacker is knocked-out by Thorns', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				EthosLabCommon,
				EthosLabCommon,
				Cat,
				...Array(5).fill(BalancedItem),
				IronSword,
				...Array(4).fill(BalancedDoubleItem),
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(Thorns, 'attach', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				// Manually set Etho health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(Cat, 'attach', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				await test.attack('primary')
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
						.at(0)?.props,
				).toStrictEqual(BalancedDoubleItem)
				await test.changeActiveHermit(1)
				await test.endTurn()

				expect(
					game.opponentPlayer.getHand().sort(CardComponent.compareOrder).at(-1)
						?.props,
				).toBe(BalancedDoubleItem)
			},
		})
	})

	test('Cat removes modal when attacker is knocked-out by Thorns and gives away last card as prize', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
			playerTwoDeck: [
				EthosLabCommon,
				EthosLabCommon,
				Cat,
				...Array(4).fill(BalancedItem),
				IronSword,
			],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(Thorns, 'attach', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				// Manually set Etho health to trigger zone
				game.components.find(
					RowComponent,
					query.row.currentPlayer,
					query.row.index(0),
				)!.health = 10
				await test.playCardFromHand(Cat, 'attach', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				expect(
					game.currentPlayer.getDrawPile().map((card) => card.props),
				).toStrictEqual([IronSword])
				await test.attack('primary')
				expect(game.state.modalRequests).toHaveLength(0)
			},
		})
	})

	test("Cat + TFC's Branch Mine and Original xB's Get Good", async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(OriginalXBRare, 'hermit', 0)
					await test.playCardFromHand(MinerDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(TinFoilChefRare, 'hermit', 0)
					await test.playCardFromHand(Cat, 'attach', 0)
					await test.playCardFromHand(MinerDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(MinerItem, 'item', 0, 1)
					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.components.get(
							(game.state.modalRequests[0].modal as SelectCards.Data).cards[0],
						)?.props,
					).toStrictEqual(Cat)
					await test.finishModalRequest({result: true, cards: null})
					await test.endTurn()

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

	test('Test Borrow does not trigger Cat when attached after flipping heads', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Cat, Cat],
				playerTwoDeck: [GrianRare, ...Array(10).fill(BalancedItem)],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Cat, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.attack('primary')
					await test.finishModalRequest({result: true, cards: null})
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Cat),
							query.card.currentPlayer,
							query.card.active,
						),
					).not.toBe(null)
					await test.endTurn()

					await test.playCardFromHand(Cat, 'attach', 0)
					await test.endTurn()

					await test.attack('primary')
					expect(game.state.modalRequests).toHaveLength(2)
					await test.finishModalRequest({result: false, cards: null})
					await test.finishModalRequest({result: true, cards: null})
					await test.endTurn()
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
