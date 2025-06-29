import {describe, expect, test} from '@jest/globals'
import Win from 'common/achievements/wins'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {testAchivement, testGame} from './utils'

describe('Test Game Utils', () => {
	test('Test fails if game ends', async () => {
		expect(
			async () =>
				await testGame(
					{
						playerOneDeck: [EthosLabCommon],
						playerTwoDeck: [EthosLabCommon],
						testGame: async (test, _game) => {
							await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
							await test.endTurn()

							await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
							await test.attack('secondary')
							// The game should never reach this point
							await test.endTurn()
						},
					},
					{oneShotMode: true},
				),
		).rejects.toThrow()
	})
	test('Test achievment tests run', async () => {
		let playedGame = false
		let checkedAchievment = false
		await testAchivement(
			{
				achievement: Win,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					playedGame = true
					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, _achievement, _outcome) {
					checkedAchievment = true
				},
			},
			{oneShotMode: true},
		)
		expect(playedGame).toBeTruthy()
		expect(checkedAchievment).toBeTruthy()
	})
})
