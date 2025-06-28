import {describe, expect, test} from '@jest/globals'
import MinecartWithTNT from 'common/cards/advent-of-tcg/single-use/tnt-minecart'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import {testGame} from '../../utils'

describe('Test TNT Minecart', () => {
	test('TNT Minecart heads deals 100hp to opponent', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, MinecartWithTNT],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(MinecartWithTNT, 'single_use')
					await test.attack('single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 100,
					)
					await test.endTurn()
				},
			},
			{forceCoinFlip: true},
		)
	})

	test('TNT Minecart tails deals 40hp backlash', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, MinecartWithTNT],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(MinecartWithTNT, 'single_use')
					await test.attack('single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 40,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					await test.endTurn()
				},
			},
			{forceCoinFlip: true},
		)
	})
})
