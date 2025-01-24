import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import {
	bufferToTurnActions,
	turnActionsToBuffer,
} from '../../server/src/routines/turn-action-compressor'
import {
	applyEffect,
	attack,
	endTurn,
	finishModalRequest,
	forfeit,
	playCardFromHand,
	testReplayGame,
} from '../unit/game/utils'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderItem from 'common/cards/items/builder-common'
import MinerItem from 'common/cards/items/miner-common'
import {DragCards} from 'common/types/modal-requests'
import {CardComponent} from 'common/components'

describe('Test Replays', () => {
	test('Test play card and attack actions', async () => {
		testReplayGame({
			playerOneDeck: [BalancedDoubleItem, EthosLabCommon],
			playerTwoDeck: [EthosLabCommon, BalancedDoubleItem],
			firstSaga: function* (con) {
				const game = con.game
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, BalancedDoubleItem, 'item', 0, 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, BalancedDoubleItem, 'item', 0, 0)
				yield* attack(game, 'primary')
				yield* endTurn(game)

				yield* attack(game, 'primary')
				yield* forfeit(game.currentPlayer.entity)
			},
			afterFirstsaga: function* (con) {
				const turnActionsBuffer = yield* turnActionsToBuffer(con)
				const turnActions = yield* bufferToTurnActions(
					con.player1Defs,
					con.player2Defs,
					con.game.rngSeed,
					con.props,
					turnActionsBuffer,
				)

				expect(
					con.game.turnActions.map((action) => action.action),
				).toStrictEqual(turnActions.map((action) => action.action))

				expect(
					con.game.turnActions.map((action) => action.player),
				).toStrictEqual(turnActions.map((action) => action.player))

				expect(con.game.turnActions.map(() => 0)).toStrictEqual(
					turnActions.map((action) => action.millisecondsSinceLastAction),
				)
			},
		})
	})

	test('Test drag cards modal', () => {
		testReplayGame({
			playerOneDeck: [
				EthosLabCommon,
				Brush,
				...Array(5).fill(Feather),
				BalancedItem,
				BuilderItem,
				MinerItem,
				Feather,
			],
			playerTwoDeck: [EthosLabCommon],
			firstSaga: function* (con) {
				yield* playCardFromHand(con.game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(con.game, Brush, 'single_use')
				yield* applyEffect(con.game)
				expect(
					(
						con.game.state.modalRequests[0].modal as DragCards.Data
					).leftCards.map((entity) => con.game.components.get(entity)?.props),
				).toStrictEqual([])
				expect(
					(
						con.game.state.modalRequests[0].modal as DragCards.Data
					).rightCards.map((entity) => con.game.components.get(entity)?.props),
				).toStrictEqual([BalancedItem, BuilderItem])
				const cardEntities = (
					con.game.state.modalRequests[0].modal as DragCards.Data
				).rightCards
				yield* finishModalRequest(con.game, {
					result: true,
					leftCards: [cardEntities[0]],
					rightCards: [cardEntities[1]],
				})
				expect(
					con.game.currentPlayer
						.getDeck()
						.sort(CardComponent.compareOrder)
						.map((card) => card.props),
				).toStrictEqual([BuilderItem, MinerItem, Feather, BalancedItem])
				yield* endTurn(con.game)
			},
			afterFirstsaga: function* (con) {
				const turnActionsBuffer = yield* turnActionsToBuffer(con)

				const turnActions = yield* bufferToTurnActions(
					con.player1Defs,
					con.player2Defs,
					con.game.rngSeed,
					con.props,
					turnActionsBuffer,
				)

				expect(con.game.turnActions).toBe(
					turnActions.map((action) => action.action),
				)
			},
		})
	})
})
