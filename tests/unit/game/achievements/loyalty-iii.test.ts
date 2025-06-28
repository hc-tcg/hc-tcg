import {describe, expect, test} from '@jest/globals'
import LoyaltyIII from 'common/achievements/loyalty-iii'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import Trident from 'common/cards/single-use/trident'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Loyalty III Achievement', () => {
	test('Test achievement is gained after three uses', () => {
		testAchivement(
			{
				achievement: LoyaltyIII,
				playerOneDeck: [EthosLabCommon, Trident],
				playerTwoDeck: [EthosLabCommon, InstantHealthII],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					yield* endTurn(game)

					await test.playCardFromHand(InstantHealthII, 'single_use')
					yield* pick(
						game,
						query.slot.active,
						query.slot.currentPlayer,
						query.slot.hermit,
					)
					yield* endTurn(game)

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					yield* endTurn(game)
					yield* endTurn(game)

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(LoyaltyIII.getProgress(achievement.goals)).toBe(3)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Test steps is one if using different tridents', () => {
		testAchivement(
			{
				achievement: LoyaltyIII,
				playerOneDeck: [EthosLabCommon, Trident, Trident],
				playerTwoDeck: [EthosLabCommon, BadOmen, InstantHealthII],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					yield* endTurn(game)

					await test.playCardFromHand(InstantHealthII, 'single_use')
					yield* pick(
						game,
						query.slot.active,
						query.slot.currentPlayer,
						query.slot.hermit,
					)
					yield* endTurn(game)

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(LoyaltyIII.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Test streak is broken after waiting a turn', () => {
		testAchivement(
			{
				achievement: LoyaltyIII,
				playerOneDeck: [EthosLabCommon, Trident],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
					yield* endTurn(game)
					yield* endTurn(game)

					// Rest for a turn
					yield* endTurn(game)
					yield* endTurn(game)

					await test.playCardFromHand(Trident, 'single_use')
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(LoyaltyIII.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
