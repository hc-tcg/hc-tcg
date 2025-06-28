import {describe, expect, test} from '@jest/globals'
import CantTouchThis from 'common/achievements/cant-touch-this'
import {Thorns} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import ZedaphPlaysRare from 'common/cards/hermits/zedaphplays-rare'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import {
	applyEffect,
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Cant Touch This achievement', () => {
	test('"Cant Touch This" counts Anvil Drop miss as only one progress', () => {
		testAchivement(
			{
				achievement: CantTouchThis,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					InvisibilityPotion,
				],
				playerTwoDeck: [GoatfatherRare],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.playCardFromHand(GoatfatherRare, 'hermit', 0)
					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(CantTouchThis.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('"Cant Touch This" streak progress is not broken by Thorns', () => {
		testAchivement(
			{
				achievement: CantTouchThis,
				playerOneDeck: [EthosLabCommon, InvisibilityPotion, InvisibilityPotion],
				playerTwoDeck: [EthosLabCommon, Thorns],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Thorns, 'attach', 0)
					await test.attack('secondary')
					yield* endTurn(game)

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					await test.attack('secondary')
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(CantTouchThis.getProgress(achievement.goals)).toBe(2)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('"Cant Touch This" counts reflected damage from Sheep Stare as one progress', () => {
		testAchivement(
			{
				achievement: CantTouchThis,
				playerOneDeck: [ZedaphPlaysRare],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.attack('primary')
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(CantTouchThis.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
