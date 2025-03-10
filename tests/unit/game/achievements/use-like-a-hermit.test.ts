import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {endTurn, forfeit, playCardFromHand, testAchivement} from '../utils'
import UseLikeAHermit from 'common/achievements/use-like-a-hermit'

describe('Test Use Like a Hermit achievement', () => {
	test('Positive Case', () => {
		testAchivement(
			{
				achievement: UseLikeAHermit,
				playerOneDeck: [ArmorStand],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(UseLikeAHermit.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
	test('Negative Case', () => {
		testAchivement(
			{
				achievement: UseLikeAHermit,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ArmorStand],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(UseLikeAHermit.getProgress(achievement.goals)).toEqual(
						undefined,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
