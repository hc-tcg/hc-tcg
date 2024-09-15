import {describe, expect, test} from '@jest/globals'
import HumanCleoRare from 'common/cards/alter-egos/hermits/humancleo-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import Iskall85Rare from 'common/cards/default/hermits/iskall85-rare'
import TangoTekRare from 'common/cards/default/hermits/tangotek-rare'
import CurseOfBinding from 'common/cards/default/single-use/curse-of-binding'
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
				playerOneDeck: [EthosLabCommon, Iskall85Common],
				playerTwoDeck: [TangoTekRare, Iskall85Rare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Iskall85Common, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* playCardFromHand(game, Iskall85Rare, 'hermit', 1)

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
				playerOneDeck: [TangoTekRare, Iskall85Rare],
				playerTwoDeck: [EthosLabCommon, CurseOfBinding],
				saga: function* (game) {
					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* playCardFromHand(game, Iskall85Rare, 'hermit', 1)

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
				playerOneDeck: [TangoTekRare, Iskall85Rare],
				playerTwoDeck: [HumanCleoRare],
				saga: function* (game) {
					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* playCardFromHand(game, Iskall85Rare, 'hermit', 1)

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
