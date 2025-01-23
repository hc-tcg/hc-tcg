import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import {
	bufferToTurnActions,
	turnActionsToBuffer,
} from '../../server/src/routines/turn-action-compressor'
import {
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testReplayGame,
} from '../unit/game/utils'

describe('Test Replays', () => {
	test('Turn game into buffer', async () => {
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

				expect(con.game.turnActions).toBe(
					turnActions.map((action) => action.action),
				)
			},
		})
	})
})
