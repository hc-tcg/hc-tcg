import {describe, expect, test} from '@jest/globals'
import GottaSchreep from 'common/achievements/gotta-schreep'
import BdoubleO100Rare from 'common/cards/hermits/bdoubleo100-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {DiamondSword} from 'common/cards/single-use/sword'
import {
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Gotta Screep achivement', () => {
	test('increments when opponent is knocked out', () => {
		testAchivement(
			{
				achievement: GottaSchreep,
				playerOneDeck: [BdoubleO100Rare, DiamondSword],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(BdoubleO100Rare, 'hermit', 0)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

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
	test('does not increment when you are awake', () => {
		testAchivement(
			{
				achievement: GottaSchreep,
				playerOneDeck: [BdoubleO100Rare, DiamondSword],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(BdoubleO100Rare, 'hermit', 0)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
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
