import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import {DiamondArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EvilXisumaRare from 'common/cards/hermits/evilxisuma-rare'
import FalseSymmetryRare from 'common/cards/hermits/falsesymmetry-rare'
import FarmerBeefRare from 'common/cards/hermits/farmerbeef-rare'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import IJevinRare from 'common/cards/hermits/ijevin-rare'
import JinglerRare from 'common/cards/hermits/jingler-rare'
import RendogCommon from 'common/cards/hermits/rendog-common'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import TinFoilChefRare from 'common/cards/hermits/tinfoilchef-rare'
import VintageBeefRare from 'common/cards/hermits/vintagebeef-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import BuilderItem from 'common/cards/items/builder-common'
import FarmDoubleItem from 'common/cards/items/farm-rare'
import MinerItem from 'common/cards/items/miner-common'
import SpeedrunnerItem from 'common/cards/items/speedrunner-common'
import SpeedrunnerDoubleItem from 'common/cards/items/speedrunner-rare'
import Chest from 'common/cards/single-use/chest'
import CurseOfBinding from 'common/cards/single-use/curse-of-binding'
import FishingRod from 'common/cards/single-use/fishing-rod'
import {DiamondSword} from 'common/cards/single-use/sword'
import query from 'common/components/query'
import {DragCards} from 'common/types/modal-requests'
import {GameController} from 'server/game-controller'
import {TurnActionCompressor} from '../../server/src/routines/turn-action-compressor'
import {
	huffmanCompress,
	huffmanDecompress,
} from '../../server/src/utils/compression'
import {testReplayGame} from '../unit/game/utils'

async function afterGame(con: GameController) {
	const turnActionCompressor = new TurnActionCompressor()

	const turnActionsBuffer = await turnActionCompressor.turnActionsToBuffer(con)

	const turnActions = await turnActionCompressor.bufferToTurnActions(
		con.player1Defs,
		con.player2Defs,
		con.game.rngSeed,
		con.props,
		turnActionsBuffer,
		con.game.id,
	)

	if (turnActions.invalid) {
		throw new Error('Turn actions were invalid')
	}

	expect(con.game.turnActions.map((action) => action.action)).toStrictEqual(
		turnActions.replay.map((action) => action.action),
	)

	expect(con.game.turnActions.map((action) => action.player)).toStrictEqual(
		turnActions.replay.map((action) => action.player),
	)
}

describe('Test Replays', () => {
	test('Test play card and attack actions', async () => {
		await testReplayGame({
			playerOneDeck: [BalancedDoubleItem, EthosLabCommon],
			playerTwoDeck: [EthosLabCommon, BalancedDoubleItem],
			runGame: async (test, con) => {
				const game = con.game
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
				await test.attack('primary')
				await test.endTurn()

				await test.attack('primary')
				await test.forfeit(game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test play card action for all card types', async () => {
		await testReplayGame({
			playerOneDeck: [
				EthosLabCommon,
				BalancedDoubleItem,
				DiamondSword,
				DiamondArmor,
			],
			playerTwoDeck: [EthosLabCommon, BalancedDoubleItem],
			runGame: async (test, con) => {
				const game = con.game
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(DiamondSword, 'single_use')
				await test.playCardFromHand(DiamondArmor, 'attach', 0)

				await test.attack('secondary')
				await test.endTurn()

				await test.forfeit(game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test drag cards modal', async () => {
		await testReplayGame({
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
			runGame: async (test, con) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(Brush, 'single_use')
				await test.applyEffect()
				const cardEntities = (
					con.game.state.modalRequests[0].modal as DragCards.Data
				).rightCards
				await test.finishModalRequest({
					result: true,
					leftCards: [cardEntities[0]],
					rightCards: [cardEntities[1]],
				})
				await test.endTurn()
				await test.forfeit(con.game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test Chest', async () => {
		await testReplayGame({
			playerOneDeck: [
				EthosLabCommon,
				CurseOfBinding,
				Chest,
				...Array(5).fill(Feather),
				BalancedItem,
				BuilderItem,
				MinerItem,
				Feather,
			],
			playerTwoDeck: [EthosLabCommon],
			runGame: async (test, con) => {
				const game = con.game
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(CurseOfBinding, 'single_use')
				await test.applyEffect()
				await test.endTurn()

				await test.endTurn()

				await test.playCardFromHand(Chest, 'single_use')
				await test.applyEffect()
				const discardedCard = game.currentPlayer.getDiscarded()[0].entity
				await test.finishModalRequest({
					result: true,
					cards: [discardedCard],
				})
				await test.endTurn()
				await test.forfeit(game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test that pick selects properly work', async () => {
		await testReplayGame({
			playerOneDeck: [EthosLabCommon, GeminiTayCommon],
			playerTwoDeck: [
				TangoTekRare,
				GeminiTayCommon,
				FarmDoubleItem,
				FarmDoubleItem,
			],
			runGame: async (test, con) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(GeminiTayCommon, 'hermit', 1)

				await test.endTurn()

				await test.playCardFromHand(TangoTekRare, 'hermit', 0)
				await test.playCardFromHand(GeminiTayCommon, 'hermit', 1)
				await test.playCardFromHand(FarmDoubleItem, 'item', 0, 0)
				await test.endTurn()

				await test.endTurn()

				await test.playCardFromHand(FarmDoubleItem, 'item', 0, 1)
				await test.attack('secondary')

				await test.pick(
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)

				await test.pick(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)

				await test.forfeit(con.game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test Speedrunner Jevin', async () => {
		await testReplayGame({
			playerOneDeck: [
				TinFoilChefRare,
				MinerItem,
				HelsknightRare,
				...Array(40).fill(MinerItem),
			],
			playerTwoDeck: [
				IJevinRare,
				SpeedrunnerItem,
				SpeedrunnerDoubleItem,
				FishingRod,
				JinglerRare,
				...Array(40).fill(SpeedrunnerItem),
			],
			runGame: async (test, con) => {
				const game = con.game
				await test.playCardFromHand(TinFoilChefRare, 'hermit', 2)
				await test.playCardFromHand(MinerItem, 'item', 2, 0)
				await test.endTurn()

				await test.playCardFromHand(IJevinRare, 'hermit', 4)
				await test.playCardFromHand(SpeedrunnerItem, 'item', 4, 0)
				await test.attack('primary')
				await test.endTurn()

				await test.playCardFromHand(MinerItem, 'item', 2, 1)
				await test.playCardFromHand(HelsknightRare, 'hermit', 1)
				await test.attack('secondary')
				await test.endTurn()

				await test.playCardFromHand(SpeedrunnerDoubleItem, 'item', 4, 1)
				await test.playCardFromHand(FishingRod, 'single_use')
				await test.applyEffect()
				await test.playCardFromHand(JinglerRare, 'hermit', 3)

				await test.attack('secondary')
				await test.pick(
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				await test.endTurn()

				await test.forfeit(game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test select attack modal works properly', async () => {
		await testReplayGame({
			playerOneDeck: [FarmerBeefRare, FarmDoubleItem],
			playerTwoDeck: [EvilXisumaRare, BalancedDoubleItem],
			runGame: async (test, con) => {
				await test.playCardFromHand(FarmerBeefRare, 'hermit', 0)
				await test.playCardFromHand(FarmDoubleItem, 'item', 0, 0)
				await test.endTurn()

				await test.playCardFromHand(EvilXisumaRare, 'hermit', 0)
				await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
				await test.attack('secondary')
				await test.finishModalRequest({
					pick: 'primary',
				})
				await test.endTurn()

				await test.attack('secondary')
				await test.endTurn()

				await test.attack('secondary')
				await test.finishModalRequest({
					pick: 'secondary',
				})
				await test.endTurn()

				await test.attack('primary')
				await test.endTurn()

				await test.forfeit(con.game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test change active Hermit action', async () => {
		await testReplayGame({
			playerOneDeck: [VintageBeefRare, FalseSymmetryRare],
			playerTwoDeck: [RendogCommon],
			runGame: async (test, con) => {
				await test.playCardFromHand(VintageBeefRare, 'hermit', 0)
				await test.playCardFromHand(FalseSymmetryRare, 'hermit', 1)
				await test.endTurn()

				await test.playCardFromHand(RendogCommon, 'hermit', 0)
				await test.endTurn()

				await test.changeActiveHermit(1)

				await test.forfeit(con.game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Test disconnect action', async () => {
		await testReplayGame({
			playerOneDeck: [VintageBeefRare, FalseSymmetryRare],
			playerTwoDeck: [RendogCommon],
			runGame: async (test, con) => {
				await test.playCardFromHand(VintageBeefRare, 'hermit', 0)
				await test.playCardFromHand(FalseSymmetryRare, 'hermit', 1)
				await test.endTurn()

				await test.playCardFromHand(RendogCommon, 'hermit', 0)
				await test.endTurn()

				await test.changeActiveHermit(1)

				await test.disconnect(con.game.currentPlayer.entity)
			},
			afterGame: afterGame,
		})
	})

	test('Huffman Tree Compression Algorithm', () => {
		// Generated from replay data
		let hexString = `
			01 00 00 10 00 01 0a d0 01 07 09 00 0a 10 01 01 09 d0 00 03 07 80 01 0b 04 00 03 0b 03 00 01 00 0e 18 01 05 30 07 05 01
			18 d2 03 02 12 56 04 06 0a 07 06 02 15 5e 01 01 2a d2 02 06 0b 0b 07 01 10 9d 80 70 70 61 50 70 80 61 c0 b0 f0 11 80 70
			50 31 68 00 50 b0 80 11 00 60 e0 70 80 01 02 00 20 10 ee 00 10 60 b0 b1 b0 12 00 70 50 62 b0 70 60 60 f0 10 00 01 00 20
			10 ad 00 20 70 c0 01 21 00 10 10 01 05 12 07 07 02 15 56 05 01 0c d2 03 00 19 08 00 05 0a 07 06 01 1b d2 02 00 0a 18 00
			06 1b 0b 15 01 10 07 07 01 19 d4 02 06 09 07 07 01 13 d8 00 03 0d 80 02 0b 06 01 10 06 0f 0b 09 01 10 07 05 02 18 4e 03
			01 26 c8 02 06 09 07 08 06 1d 0b 14 01 18 07 07 0a 12 01 01 0c ca 02 05 0a 07 05 01 10 da 03 03 0a 80 04 0b 04 01 10 06
			0e 07 07 05 2e 07 07 06 b5 07 07 01 16 cc 03 06 0c 07 07 03 13 80 05 08 06 00 10 08 01 01 0b c8 02 06 0d 00 01 02 03 04
			05 06 07 08 09 0a 0b 0c 0d 0e 0f 01 00 00 10 00 01 0a d0 01 07 09 00 0a 10 01 01 09 d0 00 03 07 80 01 0b 04 00 03 0b 03
			00 01 00 0e 18 01 05 30 07 05 01 18 d2 03 02 12 56 04 06 0a 07 06 02 15 5e 01 01 2a d2 02 06 0b 0b 07 01 10 9d 80 70 70
			61 50 70 80 61 c0 b0 f0 11 80 70 50 31 68 00 50 b0 80 11 00 60 e0 70 80 01 02 00 20 10 ee 00 10 60 b0 b1 b0 12 00 70 50
			62 b0 70 60 60 f0 10 00 01 00 20 10 ad 00 20 70 c0 01 21 00 10 10 01 05 12 07 07 02 15 56 05 01 0c d2 03 00 19 08 00 05
			0a 07 06 01 1b d2 02 00 0a 18 00 06 1b 0b 15 01 10 07 07 01 19 d4 02 06 09 07 07 01 13 d8 00 03 0d 80 02 0b 06 01 10 06
			0f 0b 09 01 10 07 05 02 18 4e 03 01 26 c8 02 06 09 07 08 06 1d 0b 14 01 18 07 07 0a 12 01 01 0c ca 02 05 0a 07 05 01 10
			da 03 03 0a 80 04 0b 04 01 10 06 0e 07 07 05 2e 07 07 06 b5 07 07 01 16 cc 03 06 0c 07 07 03 13 80 05 08 06 00 10 08 01
			01 0b c8 02 06 0d 00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 20 21
			22 23 24 25 26 27 28 29 2a 2b 2c 2d 2e 2f 30 31 32 33 34 35 36 37 38 39 3a 3b 3c 3d 3e 3f 40 41 42 43 44 45 46 47 48 49
			4a 4b 4c 4d 4e 4f 50 51 52 53 54 55 56 57 58 59 5a 5b 5c 5d 5e 5f 60 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71
			72 73 74 75 76 77 78 79 7a 7b 7c 7d 7e 7f 80 81 82 83 84 85 86 87 88 89 8a 8b 8c 8d 8e 8f 90 91 92 93 94 95 96 97 98 99
			9a 9b 9c 9d 9e 9f a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 aa ab ac ad ae af b0 b1 b2 b3 b4 b5 b6 b7 b8 b9 ba bb bc bd be bf c0 c1
			c2 c3 c4 c5 c6 c7 c8 c9 ca cb cc cd ce cf d0 d1 d2 d3 d4 d5 d6 d7 d8 d9 da db dc dd de df e0 e1 e2 e3 e4 e5 e6 e7 e8 e9
			ea eb ec ed ee ef f0 f1 f2 f3 f4 f5 f6 f7 f8 f9 fa fb fc fd fe ff 01 00 00 10 06 01 08 d0 05 07 0c 00 0d 10 05 01 09 d0
			04 02 09 56 00 06 09 07 08 01 12 d2 04 03 0e 80 02 0b 05 01 10 06 10 07 09 00 0d 18 04 01 09 d8 03 02 09 5e 00 06 09 07
			27 06 0f 07 0c 06 0e 07 08 00 12 18 05 01 0c d8 04 03 10 80 01 06 09 07 09 06 15 07 06 06 0f 07 06 0a 18 03 06 1c 07 1c
			0a 1b 03 01 09 da 04 06 0c 07 30 00 49 10 05 01 09 d0 03 03 09 80 01 09 04 03 0f 80 01 08 06 06 09 07 1e 03 0f 80 02 08
			07 00 0e 10 06 01 1b d0 02 06 08 07 24 03 14 80 03 09 0c 06 11 07 28 01 18 d2 05 06 0d 07 25 0a 10 02 01 0b d2 03 02 0b
			56 00 03 09 80 00 09 06 03 0e 80 00 06 0b 07 30 0a 0b 02 03 0a 80 04 08 06 06 17 07 26 03 16 80 02 06 0d 0c 25 02 02 02
			07 06 03 0d 80 04 0b 04 01 10 05 0e 07 07 03 18 80 00 08 05 06 0a 0c 1a 02 02 02 07 05 05 0d 07 0a 00 1c 18 04 06 11 07
			2a 06 0c 01 00 00 18 06 01 00 d8 03 07 00 00 00 18 05 01 00 d8 03 02 00 5e 00 06 00 07 00 01 00 da 03 03 00 80 02 0b 00
			01 18 06 00 07 00 00 00 20 04 01 00 e0 03 02 00 66 00 06 00 07 00 06 00 07 00 06 00 07 00 00 00 20 05 01 00 e0 02 03 00
			80 01 06 00 07 00 06 00 07 00 06 00 07 00 0a 00 04 06 00 07 00 0a 00 04 01 00 e2 02 06 00 07 00 00 00 18 05 01 00 d8 02
			03 00 80 01 08 00 06 00 07 00 03 00 80 02 08 00 00 00 18 06 01 00 d8 02 06 00 07 00 06 00 07 00 01 00 da 03 06 00 07 00
			0a 00 03 01 00 dc 03 02 00 5e 00 03 00 80 00 06 00 07 00 0a 00 03 03 00 80 04 08 00 06 00 07 00 03 00 80 02 06 00 0c 00
			02 02 02 07 00 03 00 80 04 0b 00 01 18 05 00 07 00 03 00 80 00 08 00 06 00 0c 00 02 02 02 07 00 05 00 07 00 00 00 20 04
			06 00 0c 00 02 02 02 07 00 05 00 07 00 05 00
			`
			.replaceAll('\n', '')
			.replaceAll('\t', '')
			.replaceAll(' ', '')

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
