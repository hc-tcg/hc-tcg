import {describe, expect, test} from '@jest/globals'
import SignalInversion from 'common/achievements/signal-inversion'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabUltraRare from 'common/cards/hermits/ethoslab-ultra-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Fortune from 'common/cards/single-use/fortune'
import {testAchivement} from '../utils'

describe('Test "Signal Inversion" achievement', () => {
	test('"Signal Inversion" increments', async () => {
		await testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabUltraRare, Fortune],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('does not increment if there is no coin flip', async () => {
		await testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabCommon, Fortune],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('does not increment if there is no bad omen', async () => {
		await testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabUltraRare, Fortune],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('does not increment if there is no Fortune', async () => {
		await testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabUltraRare],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
})
