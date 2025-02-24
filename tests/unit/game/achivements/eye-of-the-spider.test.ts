import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import Anvil from 'common/cards/single-use/anvil'
import EyeOfTheSpider from 'common/achievements/eye-of-the-spider'
import LavaBucket from 'common/cards/single-use/lava-bucket'

describe('Test Eye of the Spider achivement', () => {
	test('Test Eye of the Spider achivement', () => {
		testAchivement(
			{
				achievement: EyeOfTheSpider,
				playerOneDeck: [EthosLabCommon, SplashPotionOfPoison, Anvil],
				playerTwoDeck: [GeminiTayCommon, GeminiTayCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SplashPotionOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')

					yield* endTurn(game)
					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(
						EyeOfTheSpider.getProgress(achievement.goals),
					).toBeGreaterThanOrEqual(EyeOfTheSpider.levels[0].steps)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Test Eye of the Spider achivement does not increase when active hermit is knocked out', () => {
		testAchivement(
			{
				achievement: EyeOfTheSpider,
				playerOneDeck: [EthosLabCommon, SplashPotionOfPoison, Anvil],
				playerTwoDeck: [GeminiTayCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SplashPotionOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(EyeOfTheSpider.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Test Eye of the Spider achivement does not increase when any AFK is knoced out', () => {
		testAchivement(
			{
				achievement: EyeOfTheSpider,
				playerOneDeck: [EthosLabCommon, LavaBucket],
				playerTwoDeck: [GeminiTayCommon, GeminiTayCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)
					yield* endTurn(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(EyeOfTheSpider.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
})
