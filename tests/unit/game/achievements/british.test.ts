import {describe, expect, test} from '@jest/globals'
import British from 'common/achievements/british'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SpookyStressRare from 'common/cards/hermits/spookystress-rare'
import XisumavoidRare from 'common/cards/hermits/xisumavoid-rare'
import {
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test British achievement', () => {
	test('"British" achievement does not progress if only Cup of Tea is used', () => {
		testAchivement(
			{
				achievement: British,
				playerOneDeck: [XisumavoidRare],
				playerTwoDeck: [SpookyStressRare],
				playGame: function* (game) {
					yield* playCardFromHand(game, XisumavoidRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SpookyStressRare, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(British.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('"British" achievement makes progress if both secondaries are used', () => {
		testAchivement(
			{
				achievement: British,
				playerOneDeck: [XisumavoidRare, SpookyStressRare],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, XisumavoidRare, 'hermit', 0)
					yield* playCardFromHand(game, SpookyStressRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(British.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
