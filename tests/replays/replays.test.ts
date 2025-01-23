import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals'
import {CARDS_LIST} from 'common/cards'
import BdoubleO100Common from 'common/cards/hermits/bdoubleo100-common'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import BuilderDoubleItem from 'common/cards/items/builder-rare'
import Fortune from 'common/cards/single-use/fortune'
import {config} from 'dotenv'
import {Database} from 'server/db/db'
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
	let database: Database
	const BF_DEPTH = 4
	const playerDeck = {
		name: 'Testing deck',
		icon: 'balanced',
		iconType: 'item',
		cards: [
			BdoubleO100Common.numericId,
			EthosLabCommon.numericId,
			BalancedItem.numericId,
			BuilderDoubleItem.numericId,
			BuilderDoubleItem.numericId,
			Fortune.numericId,
		],
		tags: [],
	}

	beforeAll(async () => {
		const env = config()
		database = new Database(
			{
				...process.env,
				...env,
			},
			CARDS_LIST,
			BF_DEPTH,
		)
	})

	afterAll(async () => {
		await database.close()
	})

	beforeEach(async () => {
		await database.pool.query(
			'BEGIN TRANSACTION; DROP SCHEMA public CASCADE; CREATE SCHEMA public;',
		)
		return await database.new()
	})

	afterEach(async () => {
		await database.pool.query('ROLLBACK')
	})

	test('Turn game into buffer', async () => {
		testReplayGame({
			playerOneDeck: [EthosLabCommon, BalancedDoubleItem],
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
				// const turnActionsBuffer = Buffer.from([
				// 	0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xc0, 0x00, 0x07, 0x00,
				// 	0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xc0, 0x00, 0x05, 0x00, 0x07,
				// 	0x00, 0x05, 0x00,
				// ])
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
