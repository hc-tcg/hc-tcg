import {describe, expect, test} from '@jest/globals'
import LoyaltyIII from 'common/achievements/loyalty-iii'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import Trident from 'common/cards/single-use/trident'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testAchivement} from '../utils'

describe('Test Loyalty III Achievement', () => {
	test('Test achievement is gained after three uses', () => {
		testAchivement(
			{
				achievement: LoyaltyIII,
				playerOneDeck: [EthosLabCommon, Trident],
				playerTwoDeck: [EthosLabCommon, InstantHealthII],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Trident, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, InstantHealthII, 'single_use')
					yield* pick(
						game,
						query.slot.active,
						query.slot.currentPlayer,
						query.slot.hermit,
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, Trident, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Trident, 'single_use')
					yield* attack(game, 'secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(LoyaltyIII.getProgress(achievement.goals)).toBe(3)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
