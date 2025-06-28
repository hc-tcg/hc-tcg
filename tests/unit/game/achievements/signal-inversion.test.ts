import {describe, expect, test} from '@jest/globals'
import SignalInversion from 'common/achievements/signal-inversion'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabUltraRare from 'common/cards/hermits/ethoslab-ultra-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import Fortune from 'common/cards/single-use/fortune'
import {
	applyEffect,
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test "Signal Inversion" achievement', () => {
	test('"Signal Inversion" increments', () => {
		testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabUltraRare, Fortune],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.playCardFromHand(Fortune, 'single_use')
					yield* applyEffect(game)
					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('does not increment if there is no coin flip', () => {
		testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabCommon, Fortune],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.playCardFromHand(Fortune, 'single_use')
					yield* applyEffect(game)
					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('does not increment if there is no bad omen', () => {
		testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabUltraRare, Fortune],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(Fortune, 'single_use')
					yield* applyEffect(game)
					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('does not increment if there is no Fortune', () => {
		testAchivement(
			{
				achievement: SignalInversion,
				playerOneDeck: [EthosLabUltraRare],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SignalInversion.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
})
