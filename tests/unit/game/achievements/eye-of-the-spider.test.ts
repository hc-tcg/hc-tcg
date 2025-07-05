import {describe, expect, test} from '@jest/globals'
import EyeOfTheSpider from 'common/achievements/eye-of-the-spider'
import MilkBucket from 'common/cards/attach/milk-bucket'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import RenbobRare from 'common/cards/hermits/renbob-rare'
import Anvil from 'common/cards/single-use/anvil'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Eye of the Spider achievement', () => {
	test('"Eye of the Spider" counts multiple attacks as one progress', async () => {
		await testAchivement(
			{
				achievement: EyeOfTheSpider,
				playerOneDeck: [RenbobRare, SplashPotionOfPoison, Anvil],
				playerTwoDeck: [GeminiTayCommon, GeminiTayCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(RenbobRare, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(SplashPotionOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()
					await test.endTurn()

					await test.endTurn()
					await test.endTurn()

					await test.endTurn()
					await test.endTurn()

					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					await test.endTurn()
					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(EyeOfTheSpider.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Test Eye of the Spider achievement does not increase when active hermit is knocked out', async () => {
		await testAchivement(
			{
				achievement: EyeOfTheSpider,
				playerOneDeck: [EthosLabCommon, SplashPotionOfPoison, Anvil],
				playerTwoDeck: [GeminiTayCommon],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SplashPotionOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()
					await test.attack('secondary')
					await test.endTurn()
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(EyeOfTheSpider.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Test Eye of the Spider achievement does not increase when any AFK is knocked out', async () => {
		await testAchivement(
			{
				achievement: EyeOfTheSpider,
				playerOneDeck: [EthosLabCommon, LavaBucket],
				playerTwoDeck: [GeminiTayCommon, GeminiTayCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()
					await test.attack('primary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()
					await test.endTurn()

					await test.endTurn()
					await test.endTurn()

					await test.endTurn()
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(EyeOfTheSpider.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Test Eye of the Spider achievement does not increase when poison is removed with milk', async () => {
		await testAchivement(
			{
				achievement: EyeOfTheSpider,
				playerOneDeck: [EthosLabCommon, SplashPotionOfPoison, Anvil],
				playerTwoDeck: [GeminiTayCommon, MilkBucket],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SplashPotionOfPoison, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(MilkBucket, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.rowIndex(0),
						query.slot.hermit,
					)
					await test.endTurn()

					game.components.filter(RowComponent).map((row) => {
						if (row.health !== null) row.health = 10
					})

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(EyeOfTheSpider.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
})
