import {describe, expect, test} from '@jest/globals'
import TagTeam from 'common/achievements/tag-team'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {testAchivement} from '../utils'

describe('Test "Tag Team" achivement', () => {
	test('increments progress on win', async () => {
		await testAchivement(
			{
				achievement: TagTeam,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.changeActiveHermit(2)

					await test.forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TagTeam.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{},
		)
	})
	test('does not increment progress on loss', async () => {
		await testAchivement(
			{
				achievement: TagTeam,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.changeActiveHermit(2)

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TagTeam.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{},
		)
	})
})
