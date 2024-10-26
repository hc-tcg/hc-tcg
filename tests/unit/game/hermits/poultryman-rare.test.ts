import {describe, expect, test} from '@jest/globals'
import PoultryManRare from 'common/cards/hermits/poultryman-rare'
import HelsknightRare from 'common/cards/hermits/helsknight-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Egg from 'common/cards/single-use/egg'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

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

	test('Poultry Man recycles Egg on tails.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, BadOmen],
				playerTwoDeck: [PoultryManRare, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, PoultryManRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					// Hand should contain Egg.
					expect(game.currentPlayer.getHand()?.length).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Poultry Man does not recycle Egg when Trap Hole flips heads', () => {
		testGame(
			{
				playerOneDeck: [PoultryManRare, Egg],
				playerTwoDeck: [HelsknightRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, PoultryManRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, HelsknightRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					// Opponent hand should contain Egg.
					expect(game.currentPlayer.getHand()).toHaveLength(0)
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([Egg])
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
