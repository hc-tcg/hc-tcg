import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'
import Composter from 'common/cards/single-use/composter'
import query from 'common/components/query'
import SUStainable from 'common/achievements/sustainable'
import {SlotComponent} from 'common/components'

describe('Test SUStainable achivement', () => {
	test('Test SUStainable achivement', () => {
		testAchivement(
			{
				achievement: SUStainable,
				playerOneDeck: [
					EthosLabCommon,
					Composter,
					Composter,
					Composter,
					Composter,
					Composter,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Composter, 'single_use')

					let cards = game.components.filterEntities(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hand,
					)
					console.log(cards)
					yield* pick(game, query.slot.entity(cards[0]))
					yield* pick(game, query.slot.entity(cards[1]))
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Composter, 'single_use')

					cards = game.components.filterEntities(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hand,
					)

					yield* pick(game, query.slot.entity(cards[0]))
					yield* pick(game, query.slot.entity(cards[1]))

					yield* endTurn(game)

					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SUStainable.getProgress(achievement.goals)).toBe(3)
				},
			},
			{startWithAllCards: false},
		)
	})
})
