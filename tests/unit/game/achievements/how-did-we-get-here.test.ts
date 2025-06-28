import {describe, expect, test} from '@jest/globals'
import HowDidWeGetHere from 'common/achievements/how-did-we-get-here'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import PearlescentMoonRare from 'common/cards/hermits/pearlescentmoon-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Clock from 'common/cards/single-use/clock'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import {testAchivement} from '../utils'

describe('Test How Did We Get Here achievement', () => {
	test('"How Did We Get Here" counts system and damage statuses', async () => {
		await testAchivement(
			{
				achievement: HowDidWeGetHere,
				playerOneDeck: [GeminiTayRare, InvisibilityPotion, Clock],
				playerTwoDeck: [PearlescentMoonRare, SplashPotionOfPoison, BadOmen],
				playGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PearlescentMoonRare, 'hermit', 0)
					await test.playCardFromHand(SplashPotionOfPoison, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.playCardFromHand(Clock, 'single_use')
					await test.applyEffect()
					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(HowDidWeGetHere.getProgress(achievement.goals)).toBe(5)
				},
			},
			{noItemRequirements: true},
		)
	})
})
