import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals'
import {CARDS, CARDS_LIST} from 'common/cards'
import BdoubleO100Common from 'common/cards/hermits/bdoubleo100-common'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderDoubleItem from 'common/cards/items/builder-rare'
import Fortune from 'common/cards/single-use/fortune'
import {config} from 'dotenv'
import {Database} from 'server/db/db'
import {
	applyEffect,
	attack,
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../unit/game/utils'
import {turnActionsToBuffer} from 'server/routines/turn-action-compressor'

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
		testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [EthosLabCommon],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* attack(game, 'primary')
				yield* endTurn(game)
				yield* attack(game, 'primary')
				yield* forfeit(game.currentPlayer.entity)
			},
			then: function* (_game, controller) {
				console.log(yield* turnActionsToBuffer(controller))
			},
		})
	})
})
