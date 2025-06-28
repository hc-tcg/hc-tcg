import {describe, expect, test} from '@jest/globals'
import BerryBush from 'common/cards/advent-of-tcg/attach/berry-bush'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import WormManRare from 'common/cards/hermits/wormman-rare'
import Bow from 'common/cards/single-use/bow'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import Ladder from 'common/cards/single-use/ladder'
import {CardComponent, RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../../utils'

describe('Test Berry Bush Attach', () => {
	test('Berry Bush functionality', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, BerryBush, BerryBush, Bow],
			playerTwoDeck: [EthosLabCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				expect(game.getPickableSlots(BerryBush.attachCondition)).toStrictEqual(
					[],
				)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(
					BerryBush,
					'hermit',
					1,
					game.opponentPlayerEntity,
				)
				await test.playCardFromHand(
					BerryBush,
					'hermit',
					2,
					game.opponentPlayerEntity,
				)
				expect(
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(1),
					)?.health,
				).toBe(30)
				expect(
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(2),
					)?.health,
				).toBe(30)
				await test.playCardFromHand(Bow, 'single_use')
				await test.attack('single-use')
				await test.pick(
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				expect(
					game.currentPlayer.getHand().map((card) => card.props),
				).toStrictEqual([InstantHealthII, InstantHealthII])
				await test.endTurn()

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(2),
					)?.health,
				).toBe(20)
				await test.endTurn()

				await test.endTurn()

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(2),
					)?.health,
				).toBe(10)
				await test.endTurn()

				await test.endTurn()

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(2),
					)?.health,
				).toBe(null)
				expect(
					game.opponentPlayer.getHand().map((card) => card.props),
				).toStrictEqual([InstantHealthII, InstantHealthII])
			},
		})
	})

	test('Berry Bush cannot be moved by Ladder', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Ladder],
			playerTwoDeck: [EthosLabCommon, BerryBush],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(
					BerryBush,
					'hermit',
					0,
					game.opponentPlayerEntity,
				)
				await test.endTurn()

				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
				await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
				await test.playCardFromHand(Ladder, 'single_use')
				expect(
					game.components.filter(
						SlotComponent,
						game.state.pickRequests[0].canPick,
					),
				).toStrictEqual(
					game.components.filter(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					),
				)
				await test.removeEffect()
				await test.changeActiveHermit(0)
				await test.endTurn()

				await test.endTurn()

				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
			},
		})
	})

	test('Berry Bush can be placed face down by Total Anonymity', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [WormManRare, BerryBush],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(WormManRare, 'hermit', 0)
					await test.attack('secondary')
					await test.playCardFromHand(
						BerryBush,
						'hermit',
						1,
						game.opponentPlayerEntity,
					)
					expect(
						game.components.find(CardComponent, query.card.is(BerryBush))
							?.turnedOver,
					).toBe(true)
					await test.endTurn()

					await test.changeActiveHermit(1)
					expect(
						game.components.find(CardComponent, query.card.is(BerryBush))
							?.turnedOver,
					).toBe(false)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
