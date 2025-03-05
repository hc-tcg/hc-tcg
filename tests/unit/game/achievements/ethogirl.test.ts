import {describe, expect, test} from '@jest/globals'
import Ethogirl from 'common/achievements/ethogirl'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/hermits/ethoslab-rare'
import EthosLabUltraRare from 'common/cards/hermits/ethoslab-ultra-rare'
import ShadEECommon from 'common/cards/hermits/shadee-common'
import ShadeEERare from 'common/cards/hermits/shadeee-rare'
import {attack, endTurn, playCardFromHand, testAchivement} from '../utils'

describe('Test Ethogirl achievement', () => {
	test('Ethogirl progress only counts unique Etho variants on one side of the board', () => {
		testAchivement(
			{
				achievement: Ethogirl,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ShadeEERare,
					EthosLabUltraRare,
					EthosLabRare,
				],
				playerTwoDeck: [ShadEECommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ShadeEERare, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabUltraRare, 'hermit', 3)
					yield* playCardFromHand(game, EthosLabRare, 'hermit', 4)
					yield* endTurn(game)

					yield* playCardFromHand(game, ShadEECommon, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Ethogirl.getProgress(achievement.goals)).toEqual(4)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
