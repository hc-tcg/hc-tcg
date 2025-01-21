import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import FarmerBeefRare from 'common/cards/hermits/farmerbeef-rare'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import CurseOfBinding from 'common/cards/single-use/curse-of-binding'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Tango Extra Flee', () => {
	test('Both players change active hermits', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon],
				playerTwoDeck: [TangoTekRare, FarmerBeefRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefRare, 'hermit', 1)

					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(2)

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.currentPlayer.activeRow?.index).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Both players can not change active hermit with 0 afk', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [TangoTekRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)

					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Curse of Binding prevents Tango from fleeing', () => {
		testGame(
			{
				playerOneDeck: [TangoTekRare, FarmerBeefRare],
				playerTwoDeck: [EthosLabCommon, CurseOfBinding],
				saga: function* (game) {
					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefRare, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, CurseOfBinding, 'single_use')

					yield* applyEffect(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Betrayal effect does not prevent Tango from fleeing', () => {
		testGame(
			{
				playerOneDeck: [TangoTekRare, FarmerBeefRare],
				playerTwoDeck: [HumanCleoRare],
				saga: function* (game) {
					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefRare, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 0)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					// First request should be for Betrayal target
					expect(game.state.pickRequests).toHaveLength(1)
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					// Second request should be to switch active row
					expect(game.state.pickRequests).toHaveLength(1)
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.currentPlayer.activeRow?.index).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
