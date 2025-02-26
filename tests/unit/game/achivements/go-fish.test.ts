import {describe, expect, test} from '@jest/globals'
import GoFish from 'common/achievements/go-fish'
import {IronArmor} from 'common/cards/attach/armor'
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

describe('Test Go Fish Achievement', () => {
	test('Test achievement is gained after mending is drawn', () => {
		testAchivement(
			{
				achievement: GoFish,
				playerOneDeck: [
					EthosLabCommon,
					FishingRod,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FishingRod, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(GoFish.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Test achievement works properly with Gem', () => {
		testAchivement(
			{
				achievement: GoFish,
				playerOneDeck: [
					GeminiTayRare,
					EthosLabCommon,
					IronArmor,
					FishingRod,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
					Mending,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, IronArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Mending, 'single_use')

					yield* pick(
						game,
						query.slot.attach,
						query.slot.currentPlayer,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')

					yield* playCardFromHand(game, FishingRod, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(GoFish.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
