import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {
	attack,
	endTurn,
	forfeit,
	getWinner,
	playCardFromHand,
	testGame,
} from './utils'

describe('Test Game Win Conditions', () => {
	test('Killing all hermits results in victory.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerTwo')
					expect(outcome).toHaveProperty('victoryReason', 'no-hermits-on-board')
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
	test('Decked out results in victory.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerTwo')
					expect(outcome).toHaveProperty('victoryReason', 'decked-out')
				},
			},
			{noItemRequirements: true, disableDeckOut: false},
		)
	})
	test('Forfeit results in victory (current player)', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* forfeit(game.currentPlayerEntity)
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerTwo')
					expect(outcome).toHaveProperty('victoryReason', 'forfeit')
				},
			},
			{noItemRequirements: true, disableDeckOut: true},
		)
	})
	test('Forfeit results in victory (opponent player)', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* forfeit(game.opponentPlayerEntity)
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerOne')
					expect(outcome).toHaveProperty('victoryReason', 'forfeit')
				},
			},
			{noItemRequirements: true, disableDeckOut: true},
		)
	})
})
