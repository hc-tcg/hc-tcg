import {describe, expect, test} from '@jest/globals'
import Designer from 'common/achievements/designer'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SmallishbeansCommon from 'common/cards/hermits/smallishbeans-common'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import {attack, endTurn, playCardFromHand, testAchivement} from '../utils'

describe('Test Designer achievement', () => {
	test('Test "Designer" does not progress after winning with a Starter Deck', () => {
		testAchivement(
			{
				achievement: Designer,
				playerOneDeck: STARTER_DECKS[1].cards,
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, SmallishbeansCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(Designer.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, oneShotMode: true},
		)
	})

	test('Test "Designer" does progress after winning with a Starter Deck', () => {
		testAchivement(
			{
				achievement: Designer,
				playerOneDeck: [SmallishbeansCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, SmallishbeansCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(Designer.getProgress(achievement.goals)).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, oneShotMode: true},
		)
	})
})
