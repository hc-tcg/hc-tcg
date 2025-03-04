import {describe, expect, test} from '@jest/globals'
import GoFish from 'common/achievements/go-fish'
import {GoldArmor, IronArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import FishingRod from 'common/cards/single-use/fishing-rod'
import Mending from 'common/cards/single-use/mending'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'
import FreeAndSteel from 'common/achievements/free-and-steel'
import FlintAndSteel from 'common/cards/single-use/flint-and-steel'
import BalancedItem from 'common/cards/items/balanced-common'

describe('Test Free & Steel Achievement', () => {
	test('Test achievement is when hand only contains flint and steel', () => {
		testAchivement(
			{
				achievement: FreeAndSteel,
				playerOneDeck: [
					EthosLabCommon,
					FlintAndSteel,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 4)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* playCardFromHand(game, FlintAndSteel, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(FreeAndSteel.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Negative test', () => {
		testAchivement(
			{
				achievement: FreeAndSteel,
				playerOneDeck: [
					EthosLabCommon,
					FlintAndSteel,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FlintAndSteel, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(FreeAndSteel.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
