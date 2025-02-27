import {describe, expect, test} from '@jest/globals'
import HowDidWeGetHere from 'common/achievements/how-did-we-get-here'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import PearlescentMoonRare from 'common/cards/hermits/pearlescentmoon-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Clock from 'common/cards/single-use/clock'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import {
	applyEffect,
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test How Did We Get Here achievement', () => {
	test('"How Did We Get Here" counts system and damage statuses', () => {
		testAchivement(
			{
				achievement: HowDidWeGetHere,
				playerOneDeck: [GeminiTayRare, InvisibilityPotion, Clock],
				playerTwoDeck: [PearlescentMoonRare, SplashPotionOfPoison, BadOmen],
				playGame: function* (game) {
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, PearlescentMoonRare, 'hermit', 0)
					yield* playCardFromHand(game, SplashPotionOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, Clock, 'single_use')
					yield* applyEffect(game)
					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(HowDidWeGetHere.getProgress(achievement.goals)).toBe(5)
				},
			},
			{noItemRequirements: true},
		)
	})
})
