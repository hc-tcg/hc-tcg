import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {getWinner, testGame} from './utils'

describe('Test Game Win Conditions', () => {
	test('Killing all hermits results in victory.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerTwo')
					expect(outcome).toHaveProperty('victoryReason', 'no-hermits-on-board')
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
	test('Decked out results in victory.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerTwo')
					expect(outcome).toHaveProperty('victoryReason', 'decked-out')
				},
			},
			{noItemRequirements: true, disableDeckOut: false},
		)
	})
	test('Forfeit results in victory (current player)', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.forfeit(game.currentPlayerEntity)
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerTwo')
					expect(outcome).toHaveProperty('victoryReason', 'forfeit')
				},
			},
			{noItemRequirements: true, disableDeckOut: true},
		)
	})
	test('Forfeit results in victory (opponent player)', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.forfeit(game.opponentPlayerEntity)
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerOne')
					expect(outcome).toHaveProperty('victoryReason', 'forfeit')
				},
			},
			{noItemRequirements: true, disableDeckOut: true},
		)
	})
	test('Disconnect results in victory (current player)', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.disconnect(game.currentPlayerEntity)
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerTwo')
					expect(outcome).toHaveProperty('victoryReason', 'disconnect')
				},
			},
			{noItemRequirements: true, disableDeckOut: true},
		)
	})
	test('Disconnect results in victory (opponent player)', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.disconnect(game.opponentPlayerEntity)
				},
				then: (game, outcome) => {
					expect(getWinner(game)?.playerName).toBe('playerOne')
					expect(outcome).toHaveProperty('victoryReason', 'disconnect')
				},
			},
			{noItemRequirements: true, disableDeckOut: true},
		)
	})
	test('Crash gives correct game outcome', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, _game) => {
					// This action is not available which should cause the game to crash
					await test.attack('primary')
				},
				then: (_game, outcome) => {
					expect(outcome).toHaveProperty('type', 'game-crash')
				},
			},
			{noItemRequirements: true, disableDeckOut: true},
		)
	})
	test('Timeout gives correct game outcome', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (_test, _game) => {
					// The game should timeout before this promise resolves
					await new Promise((resolve) => setTimeout(resolve, 1000).unref())
				},
				then: (_game, outcome) => {
					expect(outcome).toHaveProperty('type', 'timeout')
				},
			},
			{noItemRequirements: true, disableDeckOut: true, gameTimeout: 0},
		)
	})
})
