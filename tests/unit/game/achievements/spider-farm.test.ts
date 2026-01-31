import {describe, expect, test} from '@jest/globals'
import SpiderFarm from 'common/achievements/spider-farm'
import CommandBlock from 'common/cards/attach/command-block'
import String from 'common/cards/attach/string'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import TerraformItem from 'common/cards/items/terraform-common'
import {testAchivement} from '../utils'

describe('Test "Spider Farm" achievement', () => {
	test('increments progress on 3-item secondary after two String', async () => {
		await testAchivement(
			{
				achievement: SpiderFarm,
				playerOneDeck: [EthosLabCommon, String, String],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(
						String,
						'item',
						0,
						0,
						game.opponentPlayerEntity,
					)
					await test.playCardFromHand(
						String,
						'item',
						0,
						1,
						game.opponentPlayerEntity,
					)

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SpiderFarm.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: false},
		)
	})

	test('increments progress on 3-item secondary with wrong type item after using one String', async () => {
		await testAchivement(
			{
				achievement: SpiderFarm,
				playerOneDeck: [EthosLabCommon, String],
				playerTwoDeck: [EthosLabCommon, TerraformItem],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(TerraformItem, 'item', 0, 2)
					await test.endTurn()

					await test.playCardFromHand(
						String,
						'item',
						0,
						0,
						game.opponentPlayerEntity,
					)

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SpiderFarm.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: false},
		)
	})

	test('No progress on AFK Hermit with 3-item secondary, wrong type item, and Command Block after using one String', async () => {
		await testAchivement(
			{
				achievement: SpiderFarm,
				playerOneDeck: [EthosLabCommon, String],
				playerTwoDeck: [
					EthosLabCommon,
					EthosLabCommon,
					TerraformItem,
					CommandBlock,
				],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(TerraformItem, 'item', 0, 2)
					await test.playCardFromHand(CommandBlock, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(
						String,
						'item',
						0,
						0,
						game.opponentPlayerEntity,
					)

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SpiderFarm.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: false},
		)
	})
})
