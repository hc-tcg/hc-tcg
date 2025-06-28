import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import JoeHillsRare from 'common/cards/hermits/joehills-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Clock from 'common/cards/single-use/clock'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Joe Time Skip', () => {
	test('Time Skip functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, BadOmen],
				playerTwoDeck: [JoeHillsRare],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(JoeHillsRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					await test.attack('primary')
					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					yield* changeActiveHermit(game, 0)
					await test.endTurn()

					await test.attack('secondary')
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Time Skip and Clock cannot skip consecutive turns', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [JoeHillsRare, Clock],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(JoeHillsRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					expect(game.getPickableSlots(Clock.attachCondition)).toStrictEqual([])
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					await test.attack('primary')
					await test.endTurn()

					yield* changeActiveHermit(game, 0)
					await test.endTurn()

					await test.playCardFromHand(Clock, 'single_use')
					yield* applyEffect(game)
					await test.attack('secondary')
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					await test.attack('secondary')
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
