import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EvilXisumaRare from 'common/cards/hermits/evilxisuma_rare'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import BuilderItem from 'common/cards/items/builder-common'
import FarmDoubleItem from 'common/cards/items/farm-rare'
import MinerItem from 'common/cards/items/miner-common'
import query from 'common/components/query'
import {DragCards} from 'common/types/modal-requests'
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
	pick,
	playCardFromHand,
	testReplayGame,
} from '../unit/game/utils'

describe('Test Replays', () => {
	test('Test play card and attack actions', async () => {
		testReplayGame({
			playerOneDeck: [BalancedDoubleItem, EthosLabCommon],
			playerTwoDeck: [EthosLabCommon, BalancedDoubleItem],
			gameSaga: function* (con) {
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
			afterGame: function* (con) {
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
			gameSaga: function* (con) {
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
				yield* endTurn(con.game)
				yield* forfeit(con.game.currentPlayer.entity)
			},
			afterGame: function* (con) {
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
			},
		})
	})

	test('Test that pick selects properly work', () => {
		testReplayGame({
			playerOneDeck: [EthosLabCommon, GeminiTayCommon],
			playerTwoDeck: [
				TangoTekRare,
				GeminiTayCommon,
				FarmDoubleItem,
				FarmDoubleItem,
			],
			gameSaga: function* (con) {
				const game = con.game
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 1)

				yield* endTurn(game)

				yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
				yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 1)
				yield* playCardFromHand(game, FarmDoubleItem, 'item', 0, 0)
				yield* endTurn(game)

				yield* endTurn(game)

				yield* playCardFromHand(game, FarmDoubleItem, 'item', 0, 1)
				yield* attack(game, 'secondary')

				yield* pick(
					game,
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)

				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)

				yield* forfeit(con.game.currentPlayer.entity)
			},
			afterGame: function* (con) {
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
			},
		})
	})

	test('Test select attack modal works properly', () => {
		testReplayGame({
			playerOneDeck: [EvilXisumaRare, BalancedDoubleItem],
			playerTwoDeck: [EthosLabCommon],
			gameSaga: function* (con) {
				const game = con.game

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 0)
				yield* playCardFromHand(game, BalancedDoubleItem, 'item', 0, 0)
				yield* attack(game, 'secondary')
				yield* finishModalRequest(game, {
					pick: 'secondary',
				})
				yield* endTurn(game)

				yield* forfeit(con.game.currentPlayer.entity)
			},
			afterGame: function* (con) {
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
			},
		})
	})
})
