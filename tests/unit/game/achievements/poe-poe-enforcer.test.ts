import {describe, expect, test} from '@jest/globals'
import PoePoeEnforcer from 'common/achievements/poe-poe-enforcer'
import ImpulseSVCommon from 'common/cards/hermits/impulsesv-common'
import JoeHillsCommon from 'common/cards/hermits/joehills-common'
import CurseOfBinding from 'common/cards/single-use/curse-of-binding'
import {testAchivement} from '../utils'

describe('Test Poe Poe Enforcer Achievement', () => {
	test('Test achievement is not gained when knocking out active hermit whle opponent has curse of binding', async () => {
		await testAchivement(
			{
				achievement: PoePoeEnforcer,
				playerOneDeck: [ImpulseSVCommon, CurseOfBinding],
				playerTwoDeck: [ImpulseSVCommon, ImpulseSVCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(CurseOfBinding, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PoePoeEnforcer.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false, oneShotMode: true},
		)
	})
	test('Test achievement is gained when knocking out active hermit the round after opponent has curse of binding', async () => {
		await testAchivement(
			{
				achievement: PoePoeEnforcer,
				playerOneDeck: [ImpulseSVCommon, CurseOfBinding],
				playerTwoDeck: [JoeHillsCommon, ImpulseSVCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(JoeHillsCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(CurseOfBinding, 'single_use')
					await test.applyEffect()

					await test.endTurn()
					await test.endTurn()

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PoePoeEnforcer.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false, oneShotMode: true},
		)
	})
	test('Test achievement is not gained after two rounds', async () => {
		await testAchivement(
			{
				achievement: PoePoeEnforcer,
				playerOneDeck: [ImpulseSVCommon, CurseOfBinding],
				playerTwoDeck: [ImpulseSVCommon, ImpulseSVCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ImpulseSVCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(CurseOfBinding, 'single_use')
					await test.applyEffect()

					await test.endTurn()
					await test.endTurn()

					await test.endTurn()
					await test.endTurn()

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PoePoeEnforcer.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false, oneShotMode: true},
		)
	})
})
