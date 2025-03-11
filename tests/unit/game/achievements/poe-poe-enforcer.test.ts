import {describe, expect, test} from '@jest/globals'
import PoePoeEnforcer from 'common/achievements/poe-poe-enforcer'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import CurseOfBinding from 'common/cards/single-use/curse-of-binding'
import {
	applyEffect,
	attack,
	endTurn,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Poe Poe Enforcer Achievement', () => {
	test('Test achievement is not gained when knocking out active hermit whle opponent has curse of binding', () => {
		testAchivement(
			{
				achievement: PoePoeEnforcer,
				playerOneDeck: [EthosLabCommon, CurseOfBinding],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, CurseOfBinding, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PoePoeEnforcer.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false, oneShotMode: true},
		)
	})
	test('Test achievement is gained when knocking out active hermit the round after opponent has curse of binding', () => {
		testAchivement(
			{
				achievement: PoePoeEnforcer,
				playerOneDeck: [EthosLabCommon, CurseOfBinding],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, CurseOfBinding, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PoePoeEnforcer.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false, oneShotMode: true},
		)
	})
	test('Test achievement is not gained after two rounds', () => {
		testAchivement(
			{
				achievement: PoePoeEnforcer,
				playerOneDeck: [EthosLabCommon, CurseOfBinding],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, CurseOfBinding, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PoePoeEnforcer.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false, oneShotMode: true},
		)
	})
})
