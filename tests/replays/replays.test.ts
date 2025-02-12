import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EvilXisumaRare from 'common/cards/hermits/evilxisuma_rare'
import FalseSymmetryRare from 'common/cards/hermits/falsesymmetry-rare'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import RendogCommon from 'common/cards/hermits/rendog-common'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import VintageBeefRare from 'common/cards/hermits/vintagebeef-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import BuilderItem from 'common/cards/items/builder-common'
import FarmDoubleItem from 'common/cards/items/farm-rare'
import MinerItem from 'common/cards/items/miner-common'
import query from 'common/components/query'
import {DragCards} from 'common/types/modal-requests'
import {GameController} from 'server/game-controller'
import {
	bufferToTurnActions,
	turnActionsToBuffer,
} from '../../server/src/routines/turn-action-compressor'
import {
	huffmanCompress,
	huffmanDecompress,
} from '../../server/src/utils/compression'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	forfeit,
	pick,
	playCardFromHand,
	testReplayGame,
} from '../unit/game/utils'

function* afterGame(con: GameController) {
	const turnActionsBuffer = yield* turnActionsToBuffer(con)

	const turnActions = (yield* bufferToTurnActions(
		con.player1Defs,
		con.player2Defs,
		con.game.rngSeed,
		con.props,
		turnActionsBuffer,
	)).replay

	expect(con.game.turnActions.map((action) => action.action)).toStrictEqual(
		turnActions.map((action) => action.action),
	)

	expect(con.game.turnActions.map((action) => action.player)).toStrictEqual(
		turnActions.map((action) => action.player),
	)
}

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
			afterGame: afterGame,
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
			afterGame: afterGame,
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
			afterGame: afterGame,
		})
	})

	test('Test select attack modal works properly', () => {
		testReplayGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [EvilXisumaRare, BalancedDoubleItem],
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
			afterGame: afterGame,
		})
	})

	test('Test change active Hermit action', () => {
		testReplayGame({
			playerOneDeck: [VintageBeefRare, FalseSymmetryRare],
			playerTwoDeck: [RendogCommon],
			gameSaga: function* (con) {
				const game = con.game

				yield* playCardFromHand(game, VintageBeefRare, 'hermit', 0)
				yield* playCardFromHand(game, FalseSymmetryRare, 'hermit', 1)
				yield* endTurn(game)

				yield* playCardFromHand(game, RendogCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* changeActiveHermit(game, 1)

				yield* forfeit(con.game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Huffman Tree Compression Algorithm', () => {
		// Generated from replay data
		let hexString = `
			0100001000010ad0010709000a10010109d000030780010b0400030b030001000e1801053007050118d20302125604060a070602155e01012ad202060b0b07011
			09d8070706150708061c0b0f01180705031680050b080110060e070800102002010ee001060b0b1b01200705062b0706060f0100001002010ad002070c0012100
			1010010512070702155605010cd20300190800050a0706011bd202000a1800061b0b15011007070119d402060907070113d800030d80020b060110060f0b09011
			0070502184e030126c80206090708061d0b14011807070a1201010cca02050a07050110da03030a80040b040110060e0707052e070706b507070116cc03060c07
			0703138005080600100801010bc802060d
			`.replace('\n', '')

		const replayNumbers: Array<number> = []
		while (hexString.length) {
			replayNumbers.push(Number(`0x${hexString.substring(0, 2)}`))
			hexString = hexString.substring(2)
		}
		const testBuffer = Buffer.from(replayNumbers)

		// Test compression algorithms
		const compressed = huffmanCompress(testBuffer)
		// Test decompression algorithms
		const decompressed = huffmanDecompress(compressed)

		expect(testBuffer).toStrictEqual(decompressed)
	})
})
