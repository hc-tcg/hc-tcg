import {describe, expect, test} from '@jest/globals'
import {testAchivement} from '../utils'
import TurtleMaster from 'common/achievements/turtle-master'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Emerald from 'common/cards/single-use/emerald'
import TurtleShell from 'common/cards/attach/turtle-shell'

describe('Test Turtle Master Achievement', () => {
	test('Test achievement is gained by swapping away and back to hermit that had the loose shell status', async () => {
		await testAchivement(
			{
				achievement: TurtleMaster,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Emerald],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, TurtleShell],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.changeActiveHermit(0)
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TurtleMaster.getProgress(achievement.goals)).toBe(1)
				},
			},
			{verboseLogging: true},
		)
	})
})
