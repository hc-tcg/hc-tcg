import {describe, expect, test} from '@jest/globals'
import BoomerBdubsRare from 'common/cards/hermits/boomerbdubs-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Crossbow from 'common/cards/single-use/crossbow'
import Fortune from 'common/cards/single-use/fortune'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../utils'

describe('Test Boomer Bdubs Watch This', () => {
	test('Watch This adds 20hp damage per heads', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BoomerBdubsRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, BoomerBdubsRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					// Flip 0 coins
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - BoomerBdubsRare.secondary.damage,
					)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					// Flip 1 heads
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - (BoomerBdubsRare.secondary.damage + 20),
					)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					// Flip 2 heads
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - (BoomerBdubsRare.secondary.damage + 40),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Watch This deals 0hp damage after flipping tails', () => {
		testGame(
			{
				playerOneDeck: [BoomerBdubsRare],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, BoomerBdubsRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					// Flip tails
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(game.state.modalRequests).toHaveLength(0)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Fortune only applies to first coinflip for Watch This', () => {
		testGame(
			{
				playerOneDeck: [BoomerBdubsRare, Fortune],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, BoomerBdubsRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					// Flip heads then tails
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(game.state.modalRequests).toHaveLength(0)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Watch This can only be canceled if it has not flipped a coin', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BoomerBdubsRare, Crossbow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BoomerBdubsRare, 'hermit', 0)
					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')
					// Flip 0 coins and cancel
					yield* finishModalRequest(game, {result: false, cards: null})
					yield* removeEffect(game)
					// Flip a coin and finish attack
					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.state.turn.availableActions).not.toContain(
						'REMOVE_EFFECT',
					)
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.active,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							(BoomerBdubsRare.secondary.damage + 20) -
							20 /** Crossbow */,
					)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
