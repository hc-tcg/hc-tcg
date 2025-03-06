import {describe, expect, test} from '@jest/globals'
import HorseCurse from 'common/achievements/horse-curse'
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

describe('Test Horse Curse achivement', () => {
	test('increments when opponent is knocked out', () => {
		testAchivement(
			{
				achievement: HorseCurse,
				playerOneDeck: [BdoubleO100Rare, DiamondSword],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, BdoubleO100Rare, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, DiamondSword, 'single_use')
					yield* attack(game, 'single-use')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(HorseCurse.getProgress(achievement.goals)).toBe(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('does not increment when you are awake', () => {
		testAchivement(
			{
				achievement: HorseCurse,
				playerOneDeck: [BdoubleO100Rare, DiamondSword],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, BdoubleO100Rare, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(HorseCurse.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
