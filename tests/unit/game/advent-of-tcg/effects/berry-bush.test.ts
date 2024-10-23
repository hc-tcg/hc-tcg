import {describe, expect, test} from '@jest/globals'
import BerryBush from 'common/cards/advent-of-tcg/effects/berry-bush'
import WormManRare from 'common/cards/alter-egos-iii/hermits/wormman-rare'
import Ladder from 'common/cards/alter-egos/single-use/ladder'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Bow from 'common/cards/default/single-use/bow'
import {InstantHealthII} from 'common/cards/default/single-use/instant-health'
import {CardComponent, RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../../utils'

describe('Test Berry Bush Attach', () => {
	test('Berry Bush functionality', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, BerryBush, BerryBush, Bow],
			playerTwoDeck: [EthosLabCommon],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				expect(game.getPickableSlots(BerryBush.attachCondition)).toStrictEqual(
					[],
				)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(
					game,
					BerryBush,
					'hermit',
					1,
					game.opponentPlayerEntity,
				)
				yield* playCardFromHand(
					game,
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
				yield* playCardFromHand(game, Bow, 'single_use')
				yield* attack(game, 'single-use')
				yield* pick(
					game,
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				expect(
					game.currentPlayer.getHand().map((card) => card.props),
				).toStrictEqual([InstantHealthII, InstantHealthII])
				yield* endTurn(game)

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(2),
					)?.health,
				).toBe(20)
				yield* endTurn(game)

				yield* endTurn(game)

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(2),
					)?.health,
				).toBe(10)
				yield* endTurn(game)

				yield* endTurn(game)

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

	test('Berry Bush cannot be moved by Ladder', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Ladder],
			playerTwoDeck: [EthosLabCommon, BerryBush],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(
					game,
					BerryBush,
					'hermit',
					0,
					game.opponentPlayerEntity,
				)
				yield* endTurn(game)

				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
				yield* playCardFromHand(game, Ladder, 'single_use')
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
				yield* removeEffect(game)
				yield* changeActiveHermit(game, 0)
				yield* endTurn(game)

				yield* endTurn(game)

				expect(game.getPickableSlots(Ladder.attachCondition)).toStrictEqual([])
			},
		})
	})

	test('Berry Bush can be placed face down by Total Anonymity', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [WormManRare, BerryBush],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, WormManRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* playCardFromHand(
						game,
						BerryBush,
						'hermit',
						1,
						game.opponentPlayerEntity,
					)
					expect(
						game.components.find(CardComponent, query.card.is(BerryBush))
							?.turnedOver,
					).toBe(true)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
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
