import {describe, expect, test} from '@jest/globals'
import Wipeout from 'common/achievements/wipeout'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Anvil from 'common/cards/single-use/anvil'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test "Wipeout" achievement', () => {
	test('Works when game ends when all Hermits are knocked out and game ends', async () => {
		await testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(3)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Works when some hermits live', async () => {
		await testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Works when killed by Lava Bucket', async () => {
		await testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, LavaBucket],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Only counts the highest number of knock-outs in one round', async () => {
		await testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{noItemRequirements: true},
		)
	})
})
