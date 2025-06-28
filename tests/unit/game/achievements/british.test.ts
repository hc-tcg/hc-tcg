import {describe, expect, test} from '@jest/globals'
import British from 'common/achievements/british'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SpookyStressRare from 'common/cards/hermits/spookystress-rare'
import XisumavoidRare from 'common/cards/hermits/xisumavoid-rare'
import {
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test British achievement', () => {
	test('"British" achievement does not progress if only Cup of Tea is used', async () => {
		testAchivement(
			{
				achievement: British,
				playerOneDeck: [XisumavoidRare],
				playerTwoDeck: [SpookyStressRare],
				playGame: async (test, game) => {
					await test.playCardFromHand(XisumavoidRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SpookyStressRare, 'hermit', 0)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(British.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('"British" achievement makes progress if both secondaries are used', async () => {
		testAchivement(
			{
				achievement: British,
				playerOneDeck: [XisumavoidRare, SpookyStressRare],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(XisumavoidRare, 'hermit', 0)
					await test.playCardFromHand(SpookyStressRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.changeActiveHermit( 1)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(British.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
