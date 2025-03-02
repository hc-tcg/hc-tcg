import assert from 'assert'
import {describe, expect, test} from '@jest/globals'
import Brush from 'common/cards/advent-of-tcg/single-use/brush'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import {DiamondArmor} from 'common/cards/attach/armor'
import BoomerBdubsCommon from 'common/cards/hermits/boomerbdubs-common'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EvilXisumaRare from 'common/cards/hermits/evilxisuma_rare'
import FalseSymmetryRare from 'common/cards/hermits/falsesymmetry-rare'
import FarmerBeefRare from 'common/cards/hermits/farmerbeef-rare'
import FrenchralisRare from 'common/cards/hermits/frenchralis-rare'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import LlamadadRare from 'common/cards/hermits/llamadad-rare'
import MumboJumboRare from 'common/cards/hermits/mumbojumbo-rare'
import RendogCommon from 'common/cards/hermits/rendog-common'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import VintageBeefRare from 'common/cards/hermits/vintagebeef-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import BuilderItem from 'common/cards/items/builder-common'
import FarmDoubleItem from 'common/cards/items/farm-rare'
import MinerItem from 'common/cards/items/miner-common'
import PranksterItem from 'common/cards/items/prankster-common'
import FishingRod from 'common/cards/single-use/fishing-rod'
import Fortune from 'common/cards/single-use/fortune'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import {DiamondSword} from 'common/cards/single-use/sword'
import TNT from 'common/cards/single-use/tnt'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import query from 'common/components/query'
import {DragCards} from 'common/types/modal-requests'
import {GameController} from 'server/game-controller'
import {
	bufferToTurnActions,
	turnActionsToBuffer,
} from '../../server/src/routines/turn-action-compressor'
import {
	createHuffmanTree,
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
	removeEffect,
	testReplayGame,
} from '../unit/game/utils'

function* afterGame(con: GameController) {
	const turnActionsBuffer = yield* turnActionsToBuffer(con)

	const turnActions = yield* bufferToTurnActions(
		con.player1Defs,
		con.player2Defs,
		con.game.rngSeed,
		con.props,
		turnActionsBuffer,
	)

	expect(con.game.turnActions.map((action) => action.action)).toStrictEqual(
		turnActions.replay.map((action) => action.action),
	)

	expect(con.game.turnActions.map((action) => action.player)).toStrictEqual(
		turnActions.replay.map((action) => action.player),
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
			playerOneDeck: [FarmerBeefRare, FarmDoubleItem],
			playerTwoDeck: [EvilXisumaRare, BalancedDoubleItem],
			gameSaga: function* (con) {
				const game = con.game

				yield* playCardFromHand(game, FarmerBeefRare, 'hermit', 0)
				yield* playCardFromHand(game, FarmDoubleItem, 'item', 0, 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 0)
				yield* playCardFromHand(game, BalancedDoubleItem, 'item', 0, 0)
				yield* attack(game, 'secondary')
				yield* finishModalRequest(game, {
					pick: 'primary',
				})
				yield* endTurn(game)

				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* attack(game, 'secondary')
				yield* finishModalRequest(game, {
					pick: 'secondary',
				})
				yield* endTurn(game)

				yield* attack(game, 'primary')
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

	test('Test a full game', () => {
		const playerOneDeck = STARTER_DECKS.find(
			(deck) => deck.name === 'Balanced Deck #1',
		)
		const playerTwoDeck = STARTER_DECKS.find(
			(deck) => deck.name === 'Prankster Deck #2',
		)

		assert(playerOneDeck, 'The deck should exist.')
		assert(playerTwoDeck, 'The deck should exist.')

		testReplayGame({
			playerOneDeck: playerOneDeck.cards.sort(
				(a, b) => a.numericId - b.numericId,
			),
			playerTwoDeck: playerTwoDeck.cards.sort(
				(a, b) => a.numericId - b.numericId,
			),
			seed: '0.ea5a6943997d7',
			shuffleDeck: true,
			gameSaga: function* (con) {
				const game = con.game

				yield* playCardFromHand(game, BoomerBdubsCommon, 'hermit', 2)
				yield* playCardFromHand(game, PranksterItem, 'item', 2, 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 2)
				yield* playCardFromHand(game, BalancedDoubleItem, 'item', 2, 0)
				yield* playCardFromHand(game, DiamondArmor, 'attach', 2)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, PranksterItem, 'item', 2, 1)
				yield* playCardFromHand(game, InstantHealthII, 'single_use')
				yield* pick(
					game,
					query.slot.active,
					query.slot.currentPlayer,
					query.slot.hermit,
				)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, LlamadadRare, 'hermit', 3)
				yield* playCardFromHand(game, BalancedDoubleItem, 'item', 3, 0)
				yield* playCardFromHand(game, DiamondArmor, 'attach', 3)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, MumboJumboRare, 'hermit', 3)
				yield* playCardFromHand(game, PranksterItem, 'item', 3, 0)
				yield* playCardFromHand(game, GoldenAxe, 'single_use')
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield changeActiveHermit(game, 3)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield changeActiveHermit(game, 3)
				yield* playCardFromHand(game, PranksterItem, 'item', 3, 1)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 2)
				yield* playCardFromHand(game, BalancedItem, 'item', 2, 0)
				yield* playCardFromHand(game, Fortune, 'single_use')
				yield* removeEffect(game)
				yield* playCardFromHand(game, Fortune, 'single_use')
				yield* applyEffect(game)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, FishingRod, 'single_use')
				yield* applyEffect(game)
				yield* playCardFromHand(game, FrenchralisRare, 'hermit', 2)
				yield* playCardFromHand(game, PranksterItem, 'item', 2, 0)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, TNT, 'single_use')
				yield* removeEffect(game)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, PranksterItem, 'item', 2, 1)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* changeActiveHermit(game, 2)
				yield* playCardFromHand(game, BalancedItem, 'item', 2, 2)
				yield* playCardFromHand(game, DiamondArmor, 'attach', 2)
				yield* playCardFromHand(game, DiamondSword, 'single_use')
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* changeActiveHermit(game, 2)
				yield* playCardFromHand(game, FishingRod, 'single_use')
				yield* applyEffect(game)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* playCardFromHand(game, TNT, 'single_use')
				yield* attack(game, 'secondary')
				yield* finishModalRequest(game, {
					pick: 'secondary',
				})
				yield* endTurn(game)

				yield* playCardFromHand(game, InstantHealthII, 'single_use')
				yield* pick(
					game,
					query.slot.active,
					query.slot.currentPlayer,
					query.slot.hermit,
				)
				yield* attack(game, 'primary')
				yield* endTurn(game)

				yield* playCardFromHand(game, Fortune, 'single_use')
				yield* applyEffect(game)
				yield* attack(game, 'secondary')
				yield* finishModalRequest(game, {
					pick: 'secondary',
				})
				yield* endTurn(game)

				yield* attack(game, 'primary')
				yield* endTurn(game)

				yield* playCardFromHand(game, FrenchralisRare, 'hermit', 3)
				yield* attack(game, 'secondary')
				yield* finishModalRequest(game, {
					pick: 'secondary',
				})
				yield* endTurn(game)

				yield* attack(game, 'primary')
			},
			afterGame: () => {},
		})
	})

	test('Huffman Tree Compression Algorithm', () => {
		// Generated from replay data
		let hexString = `
			0100001000010ad0010709000a10010109d000030780010b0400030b030001000e1801053007050118d20302125604060a070602155e01012ad202060b0b07011
			09d8070706150708061c0b0f01180705031680050b080110060e070800102002010ee001060b0b1b01200705062b0706060f0100001002010ad002070c0012100
			1010010512070702155605010cd20300190800050a0706011bd202000a1800061b0b15011007070119d402060907070113d800030d80020b060110060f0b09011
			0070502184e030126c80206090708061d0b14011807070a1201010cca02050a07050110da03030a80040b040110060e0707052e070706b507070116cc03060c07
			0703138005080600100801010bc802060d000102030405060708090a0b0c0d0e0f0100001000010ad0010709000a10010109d000030780010b0400030b0300010
			00e1801053007050118d20302125604060a070602155e01012ad202060b0b0701109d8070706150708061c0b0f01180705031680050b080110060e07080010200
			2010ee001060b0b1b01200705062b0706060f0100001002010ad002070c00121001010010512070702155605010cd20300190800050a0706011bd202000a18000
			61b0b15011007070119d402060907070113d800030d80020b060110060f0b090110070502184e030126c80206090708061d0b14011807070a1201010cca02050a
			07050110da03030a80040b040110060e0707052e070706b507070116cc03060c070703138005080600100801010bc802060d000102030405060708090a0b0c0d0
			e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e
			4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8
			f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecf
			d0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff
			`
			.replaceAll('\n', '')
			.replaceAll('\t', '')

		const replayNumbers: Array<number> = []
		const splitString: Array<string> = []
		while (hexString.length) {
			replayNumbers.push(Number(`0x${hexString.substring(0, 2)}`))
			splitString.push(hexString.substring(0, 2))
			hexString = hexString.substring(2)
		}
		const testBuffer = Buffer.from(replayNumbers)

		splitString.push('EOF')
		const tree = createHuffmanTree(splitString)
		console.dir(tree, {maxArrayLength: null})

		// Test compression algorithms
		const compressed = huffmanCompress(testBuffer)
		// Test decompression algorithms
		const decompressed = huffmanDecompress(compressed)

		expect(testBuffer).toStrictEqual(decompressed)
	})
})
