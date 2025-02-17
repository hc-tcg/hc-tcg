import {expect, test} from '@jest/globals'
import UseLikeAHermit from 'common/achievements/use-like-a-hermit'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {endTurn, forfeit, playCardFromHand, testAchivement} from '../utils'

test('Test Use Like a Hermit achievement', () => {
	testAchivement(
		{
			achievement: UseLikeAHermit,
			playerOneDeck: [ArmorStand],
			playerTwoDeck: [EthosLabCommon],
			playGame: function* (game) {
				yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
				yield* endTurn(game)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* endTurn(game)
				yield* endTurn(game)

				yield* forfeit(game.currentPlayer.entity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(UseLikeAHermit.getProgress(achievement.goals)).toEqual(2)
			},
		},
		{oneShotMode: true, noItemRequirements: true},
	)
})
