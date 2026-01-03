import {describe, expect, test} from '@jest/globals'
import iBuy from 'common/achievements/ibuy'
import {IronArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import OriginalXBRare from 'common/cards/hermits/originalxb-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import Chest from 'common/cards/single-use/chest'
import CurseOfVanishing from 'common/cards/single-use/curse-of-vanishing'
import {testAchivement} from '../utils'

describe('Test iBuy Achievement', () => {
	test('Test drawing a copy of an played Attach effect', async () => {
		await testAchivement({
			achievement: iBuy,
			playerOneDeck: [
				EthosLabCommon,
				IronArmor,
				Chest,
				...Array(5).fill(BalancedItem),
				IronArmor,
			],
			playerTwoDeck: [EthosLabCommon, CurseOfVanishing],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(IronArmor, 'attach', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(CurseOfVanishing, 'single_use')
				await test.applyEffect()
				await test.endTurn()

				await test.playCardFromHand(Chest, 'single_use')
				await test.finishModalRequest({
					result: true,
					cards: game.currentPlayer.getDiscarded().map((card) => card.entity),
				})
				await test.playCardFromHand(IronArmor, 'attach', 0)
				await test.endTurn()

				await test.forfeit(game.currentPlayerEntity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(iBuy.getProgress(achievement.goals)).toBe(1)
			},
		})
	})

	test('Test drawing a chested card after opponent used Get Good', async () => {
		await testAchivement(
			{
				achievement: iBuy,
				playerOneDeck: [
					EthosLabCommon,
					IronArmor,
					Chest,
					...Array(6).fill(BalancedItem),
					IronArmor,
				],
				playerTwoDeck: [OriginalXBRare, CurseOfVanishing],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(IronArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(OriginalXBRare, 'hermit', 0)
					await test.playCardFromHand(CurseOfVanishing, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Chest, 'single_use')
					await test.finishModalRequest({
						result: true,
						cards: game.currentPlayer.getDiscarded().map((card) => card.entity),
					})
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(iBuy.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Test drawing a chested card after using 2 Chests with Geminislay', async () => {
		await testAchivement(
			{
				achievement: iBuy,
				playerOneDeck: [
					GeminiTayRare,
					IronArmor,
					Chest,
					Chest,
					...Array(4).fill(BalancedItem),
					IronArmor,
				],
				playerTwoDeck: [EthosLabCommon, CurseOfVanishing],
				playGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(IronArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(CurseOfVanishing, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Chest, 'single_use')
					await test.finishModalRequest({
						result: true,
						cards: game.currentPlayer.getDiscarded().map((card) => card.entity),
					})
					await test.attack('secondary')
					await test.playCardFromHand(Chest, 'single_use')
					await test.finishModalRequest({
						result: true,
						cards: game.currentPlayer.getDiscarded().map((card) => card.entity),
					})
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(iBuy.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})
})
