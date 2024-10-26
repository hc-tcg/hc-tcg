import {describe, expect, test} from '@jest/globals'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import Anvil from 'common/cards/single-use/anvil'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import IronSword from 'common/cards/single-use/iron-sword'
import TNT from 'common/cards/single-use/tnt'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test Hels Trap Hole', () => {
	test('Test Trap Hole with TNT', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, TNT],
				playerTwoDeck: [HelsknightRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, HelsknightRare, 'hermit', 0)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* playCardFromHand(game, TNT, 'single_use')

					yield* attack(game, 'single-use')

					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([TNT])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Trap Hole when Anvil misses', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [HelsknightRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, HelsknightRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Anvil, 'single_use')
					expect(Anvil.attackPreview?.(game)).toBe('$A0$')
					yield* attack(game, 'single-use')
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([Anvil])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Trap Hole against Geminislay', () => {
		testGame(
			{
				playerOneDeck: [GeminiTayRare, IronSword, IronSword],
				playerTwoDeck: [HelsknightRare],
				saga: function* (game) {
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, HelsknightRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')
					expect(
						game.currentPlayer.coinFlips.filter((flip) => flip.opponentFlip),
					).toHaveLength(1)
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([IronSword])
					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'single-use')
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
