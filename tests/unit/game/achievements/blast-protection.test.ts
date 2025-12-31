import {describe, expect, test} from '@jest/globals'
import BlastProtection from 'common/achievements/blast-protection'
import {ChainmailArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import TNT from 'common/cards/single-use/tnt'
import {testAchivement} from '../utils'

describe('Test Blast Protection Achievement', () => {
	test('Test active wearing chainmail while using TNT', async () => {
		await testAchivement({
			achievement: BlastProtection,
			playerOneDeck: [EthosLabCommon, ChainmailArmor, TNT],
			playerTwoDeck: [EthosLabCommon],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(ChainmailArmor, 'attach', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(TNT, 'single_use')
				await test.attack('single-use')
				await test.endTurn()

				await test.forfeit(game.currentPlayerEntity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(BlastProtection.getProgress(achievement.goals)).toBe(1)
			},
		})
	})

	test('Test active wearing chainmail while opponent using TNT', async () => {
		await testAchivement({
			achievement: BlastProtection,
			playerOneDeck: [EthosLabCommon, ChainmailArmor],
			playerTwoDeck: [EthosLabCommon, TNT],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(ChainmailArmor, 'attach', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(TNT, 'single_use')
				await test.attack('single-use')
				await test.endTurn()

				await test.forfeit(game.currentPlayerEntity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(BlastProtection.getProgress(achievement.goals)).toBeFalsy()
			},
		})
	})

	test('Test opponent burning after using TNT', async () => {
		await testAchivement({
			achievement: BlastProtection,
			playerOneDeck: [EthosLabCommon, LavaBucket, TNT],
			playerTwoDeck: [EthosLabCommon],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(LavaBucket, 'single_use')
				await test.applyEffect()
				await test.endTurn()

				await test.endTurn()

				await test.playCardFromHand(TNT, 'single_use')
				await test.attack('single-use')
				await test.endTurn()

				await test.forfeit(game.currentPlayerEntity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(BlastProtection.getProgress(achievement.goals)).toBeFalsy()
			},
		})
	})
})
