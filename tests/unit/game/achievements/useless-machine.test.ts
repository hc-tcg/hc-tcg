import {describe, expect, test} from '@jest/globals'
import UselessMachine from 'common/achievements/useless-machine'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Composter from 'common/cards/single-use/composter'
import FlintAndSteel from 'common/cards/single-use/flint-and-steel'
import query from 'common/components/query'
import {
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Useless Machine Achievement', () => {
	test('Test achievement is gained when drawing two duplicates', () => {
		testAchivement(
			{
				achievement: UselessMachine,
				playerOneDeck: [
					EthosLabCommon,
					Composter,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Composter, 'single_use')
					yield* pick(
						game,
						query.slot.hand,
						query.slot.currentPlayer,
						query.slot.order(2),
					)
					yield* pick(
						game,
						query.slot.hand,
						query.slot.currentPlayer,
						query.slot.order(3),
					)
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(UselessMachine.getProgress(achievement.goals)).toBe(2)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Test one duplicate card', () => {
		testAchivement(
			{
				achievement: UselessMachine,
				playerOneDeck: [
					EthosLabCommon,
					Composter,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					FlintAndSteel,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Composter, 'single_use')
					console.log('HERE')
					yield* pick(
						game,
						query.slot.hand,
						query.slot.currentPlayer,
						query.slot.order(2),
					)
					yield* pick(
						game,
						query.slot.hand,
						query.slot.currentPlayer,
						query.slot.order(3),
					)
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(UselessMachine.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Test zero duplicate card', () => {
		testAchivement(
			{
				achievement: UselessMachine,
				playerOneDeck: [
					EthosLabCommon,
					Composter,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					FlintAndSteel,
					FlintAndSteel,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Composter, 'single_use')
					yield* pick(
						game,
						query.slot.hand,
						query.slot.currentPlayer,
						query.slot.order(2),
					)
					yield* pick(
						game,
						query.slot.hand,
						query.slot.currentPlayer,
						query.slot.order(3),
					)
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(UselessMachine.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
