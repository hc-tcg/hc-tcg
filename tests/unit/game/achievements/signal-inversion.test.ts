import {describe, expect, test} from '@jest/globals'
import EyeOfTheSpider from 'common/achievements/eye-of-the-spider'
import SignalInversion from 'common/achievements/signal-inversion.test'
import EthosLabUltraRare from 'common/cards/hermits/ethoslab-ultra-rare'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import Fortune from 'common/cards/single-use/fortune'
import {testAchivement} from '../utils'

describe('Test "Signal Inversion" achievement', () => {
	test('"Signal Inversion" counts multiple attacks as one progress', () => {
		testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabUltraRare, Fortune],
				playerTwoDeck: [GeminiTayCommon, GeminiTayCommon],
				playGame: function* (_game) {},
				checkAchivement(_game, achievement, _outcome) {
					expect(EyeOfTheSpider.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})
})
