import {describe, expect, test} from '@jest/globals'
import BoomerBdubsRare from 'common/cards/hermits/boomerbdubs-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BadOmen from 'common/cards/single-use/bad-omen'
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
	test('Watch This adds 20hp damage per heads', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BoomerBdubsRare],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.attack('secondary')
					// Flip 0 coins
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - BoomerBdubsRare.secondary.damage,
					)
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					await test.attack('secondary')
					// Flip 1 heads
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - (BoomerBdubsRare.secondary.damage + 20),
					)
					await test.endTurn()

					yield* changeActiveHermit(game, 2)
					await test.endTurn()

					await test.attack('secondary')
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

	test('Watch This deals 0hp damage after flipping tails', async () => {
		await testGame(
			{
				playerOneDeck: [BoomerBdubsRare],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				saga: async (test, game) => {
					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					// Flip tails
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(game.state.modalRequests).toHaveLength(0)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Fortune only applies to first coinflip for Watch This', async () => {
		await testGame(
			{
				playerOneDeck: [BoomerBdubsRare, Fortune],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				saga: async (test, game) => {
					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					// Flip heads then tails
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(game.state.modalRequests).toHaveLength(0)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Watch This can only be canceled if it has not flipped a coin', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BoomerBdubsRare, Crossbow],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					// Flip 0 coins and cancel
					yield* finishModalRequest(game, {result: false, cards: null})
					yield* removeEffect(game)
					// Flip a coin and finish attack
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.state.turn.availableActions).not.toContain(
						'REMOVE_EFFECT',
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.active,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							(BoomerBdubsRare.secondary.damage + 20) -
							20 /** Crossbow */,
					)
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
