import {describe, expect, test} from '@jest/globals'
import PoultryManRare from 'common/cards/alter-egos-iii/hermits/poultryman-rare'
import Egg from 'common/cards/alter-egos/single-use/egg'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from './utils'

describe('Test Poutry Man Rare', () => {
	test('Poultry Man only recycles Egg.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [PoultryManRare, Egg, GoldenAxe],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, PoultryManRare, 'hermit', 0)
					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(1)

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					// Hand should contain Egg and Golden Axe.
					expect(game.currentPlayer.getHand()?.length).toBe(2)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')

					// Hand should only contain Egg.
					expect(game.currentPlayer.getHand()?.length).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
