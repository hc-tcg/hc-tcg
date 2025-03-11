import {describe, expect, test} from '@jest/globals'
import TagTeam from 'common/achievements/tag-team'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {
	changeActiveHermit,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test "Tag Team" achivement', () => {
	test('increments progress on win', () => {
		testAchivement(
			{
				achievement: TagTeam,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TagTeam.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{},
		)
	})
	test('does not increment progress on loss', () => {
		testAchivement(
			{
				achievement: TagTeam,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TagTeam.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{},
		)
	})
})
