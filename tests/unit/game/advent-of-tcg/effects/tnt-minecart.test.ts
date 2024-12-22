import {describe, expect, test} from '@jest/globals'
import MinecartWithTNT from 'common/cards/advent-of-tcg/single-use/tnt-minecart'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import {
	applyEffect,
	attack,
	endTurn,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test TNT Minecart', () => {
	test('TNT Minecart heads deals 100hp to opponent', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, MinecartWithTNT],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, MinecartWithTNT, 'single_use')
					yield* attack(game, 'single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 100,
					)
					yield* endTurn(game)
				},
			},
			{forceCoinFlip: true},
		)
	})

	test('TNT Minecart tails deals 40hp backlash', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, MinecartWithTNT],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, MinecartWithTNT, 'single_use')
					yield* attack(game, 'single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 40,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					yield* endTurn(game)
				},
			},
			{forceCoinFlip: true},
		)
	})
})
