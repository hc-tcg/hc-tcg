import {describe, expect, test} from '@jest/globals'
import IsGreat from 'common/achievements/is-great'
import BdoubleO100Rare from 'common/cards/hermits/bdoubleo100-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/hermits/ethoslab-rare'
import {testAchivement} from '../utils'

describe('Test "...is Great" achievement', () => {
	test('Check should be valid', async () => {
		await testAchivement(
			{
				achievement: IsGreat,
				playerOneDeck: [BdoubleO100Rare, BdoubleO100Rare, BdoubleO100Rare],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(IsGreat.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
	test('Check invalid (two costs are in deck)', async () => {
		await testAchivement(
			{
				achievement: IsGreat,
				playerOneDeck: [BdoubleO100Rare, EthosLabRare],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(IsGreat.getProgress(achievement.goals)).toBeUndefined()
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
