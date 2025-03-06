import {describe, expect, test} from '@jest/globals'
import PeskyBird from 'common/achievements/pesky-bird'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import JinglerRare from 'common/cards/hermits/jingler-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import Composter from 'common/cards/single-use/composter'
import {SlotComponent} from 'common/components'
import query from 'common/components/query'
import {
	attack,
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Pesky Bird Achievement', () => {
	test('Test achievement progress increases after forcing opponnet to discard card', () => {
		testAchivement(
			{
				achievement: PeskyBird,
				playerOneDeck: [JinglerRare],
				playerTwoDeck: [
					EthosLabCommon,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playGame: function* (game) {
					yield* playCardFromHand(game, JinglerRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.hand,
						query.slot.opponent,
						query.not(query.slot.empty),
					)
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PeskyBird.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false, forceCoinFlip: true},
		)
	})
	test('Test achievement progress stays the same when you discard your own card', () => {
		testAchivement(
			{
				achievement: PeskyBird,
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
					yield* pick(game, query.slot.entity(cards[0]))
					yield* pick(game, query.slot.entity(cards[1]))

					yield* forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PeskyBird.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{startWithAllCards: false},
		)
	})
})
