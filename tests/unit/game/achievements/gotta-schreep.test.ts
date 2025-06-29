import {describe, expect, test} from '@jest/globals'
import GottaSchreep from 'common/achievements/gotta-schreep'
import BdoubleO100Rare from 'common/cards/hermits/bdoubleo100-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {DiamondSword} from 'common/cards/single-use/sword'
import {testAchivement} from '../utils'

describe('Test Gotta Screep achivement', () => {
	test('increments when opponent is knocked out', async () => {
		await testAchivement(
			{
				achievement: GottaSchreep,
				playerOneDeck: [BdoubleO100Rare, DiamondSword],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(BdoubleO100Rare, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(DiamondSword, 'single_use')
					await test.attack('single-use')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(GottaSchreep.getProgress(achievement.goals)).toBe(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('does not increment when you are awake', async () => {
		await testAchivement(
			{
				achievement: GottaSchreep,
				playerOneDeck: [BdoubleO100Rare, DiamondSword],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(BdoubleO100Rare, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(GottaSchreep.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
