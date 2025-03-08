import {describe, expect, test} from '@jest/globals'
import Ethogirl from 'common/achievements/ethogirl'
import IsGreat from 'common/achievements/is-great'
import BdoubleO100Rare from 'common/cards/hermits/bdoubleo100-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/hermits/ethoslab-rare'
import ShadEECommon from 'common/cards/hermits/shadee-common'
import {forfeit, testAchivement} from '../utils'

describe('Test "...is Great" achievement', () => {
	test('Check should be valid', () => {
		testAchivement(
			{
				achievement: IsGreat,
				playerOneDeck: [BdoubleO100Rare, BdoubleO100Rare, BdoubleO100Rare],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(IsGreat.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
	test('Check invalid (two costs are in deck)', () => {
		testAchivement(
			{
				achievement: Ethogirl,
				playerOneDeck: [BdoubleO100Rare, EthosLabRare],
				playerTwoDeck: [ShadEECommon],
				playGame: function* (game) {
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Ethogirl.getProgress(achievement.goals)).toBeUndefined()
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
