import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import Anvil from 'common/cards/single-use/anvil'
import {IronSword} from 'common/cards/single-use/sword'
import TNT from 'common/cards/single-use/tnt'
import {testGame} from '../utils'

describe('Test Hels Trap Hole', () => {
	test('Test Trap Hole with TNT', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, TNT],
				playerTwoDeck: [HelsknightRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(HelsknightRare, 'hermit', 0)

					await test.attack('secondary')

					await test.endTurn()

					await test.playCardFromHand(TNT, 'single_use')

					await test.attack('single-use')

					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([TNT])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Trap Hole when Anvil misses', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [HelsknightRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(HelsknightRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Anvil, 'single_use')
					expect(Anvil.attackPreview?.(game)).toBe('$A0$')
					await test.attack('single-use')
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([Anvil])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Trap Hole against Geminislay', async () => {
		await testGame(
			{
				playerOneDeck: [GeminiTayRare, IronSword, IronSword],
				playerTwoDeck: [HelsknightRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(HelsknightRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('secondary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([IronSword])
					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('single-use')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([IronSword, IronSword])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
