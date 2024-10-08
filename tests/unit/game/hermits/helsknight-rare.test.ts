import {describe, expect, test} from '@jest/globals'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
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
})
