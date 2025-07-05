import {describe, expect, test} from '@jest/globals'
import BoomerBdubsRare from 'common/cards/hermits/boomerbdubs-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import Crossbow from 'common/cards/single-use/crossbow'
import Fortune from 'common/cards/single-use/fortune'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Boomer Bdubs Watch This', () => {
	test('Watch This adds 20hp damage per heads', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [BoomerBdubsRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.attack('secondary')
					// Flip 0 coins
					await test.finishModalRequest({result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - BoomerBdubsRare.secondary.damage,
					)
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.attack('secondary')
					// Flip 1 heads
					await test.finishModalRequest({result: true, cards: null})
					await test.finishModalRequest({result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - (BoomerBdubsRare.secondary.damage + 20),
					)
					await test.endTurn()

					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.attack('secondary')
					// Flip 2 heads
					await test.finishModalRequest({result: true, cards: null})
					await test.finishModalRequest({result: true, cards: null})
					await test.finishModalRequest({result: false, cards: null})
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
				testGame: async (test, game) => {
					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					// Flip tails
					await test.finishModalRequest({result: true, cards: null})
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
				testGame: async (test, game) => {
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
					await test.finishModalRequest({result: true, cards: null})
					await test.finishModalRequest({result: true, cards: null})
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BoomerBdubsRare, 'hermit', 0)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					// Flip 0 coins and cancel
					await test.finishModalRequest({result: false, cards: null})
					await test.removeEffect()
					// Flip a coin and finish attack
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					await test.finishModalRequest({result: true, cards: null})
					await test.finishModalRequest({result: false, cards: null})
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
