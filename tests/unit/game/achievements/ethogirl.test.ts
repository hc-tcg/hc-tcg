import {describe, expect, test} from '@jest/globals'
import Ethogirl from 'common/achievements/ethogirl'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/hermits/ethoslab-rare'
import EthosLabUltraRare from 'common/cards/hermits/ethoslab-ultra-rare'
import ShadEECommon from 'common/cards/hermits/shadee-common'
import ShadeEERare from 'common/cards/hermits/shadeee-rare'
import {
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

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
					// Identical cards should be counted the same
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ShadeEERare, 'hermit', 2)
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 3)
					await test.playCardFromHand(EthosLabRare, 'hermit', 4)
					yield* endTurn(game)

					await test.playCardFromHand(ShadEECommon, 'hermit', 0)
					yield* endTurn(game)

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Ethogirl.getProgress(achievement.goals)).toEqual(4)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
	test('progress does not increase on loss', () => {
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
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ShadeEERare, 'hermit', 2)
					await test.playCardFromHand(EthosLabUltraRare, 'hermit', 3)
					await test.playCardFromHand(EthosLabRare, 'hermit', 4)
					yield* endTurn(game)

					await test.playCardFromHand(ShadEECommon, 'hermit', 0)
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Ethogirl.getProgress(achievement.goals)).toBeUndefined()
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
