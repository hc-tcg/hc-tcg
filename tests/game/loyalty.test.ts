import {describe, expect, test} from '@jest/globals'
import Loyalty from 'common/cards/default/effects/loyalty'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import BalancedItem from 'common/cards/default/items/balanced-common'
import {GameModel} from 'common/models/game-model'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

function* testLoyaltyHelperSaga(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 0)
	yield* playCardFromHand(game, Loyalty, 0)
	yield* playCardFromHand(game, BalancedItem, 0, 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, EthosLabCommon, 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, EthosLabCommon, 1)
	yield* playCardFromHand(game, BalancedItem, 1, 0)

	yield* endTurn(game)

	yield* attack(game, 'primary')

	yield* endTurn(game)

	// The player should only have one balanced item that they got returned to their hand
	// by loyalty.
	expect(game.currentPlayer.getHand().map((card) => card.props)).toStrictEqual([
		BalancedItem,
	])
}

describe('Test Loyalty', () => {
	test('Test Loyalty only returns item cards from attached hermit.', () => {
		testGame(
			{
				saga: testLoyaltyHelperSaga,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					Loyalty,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [EthosLabCommon],
			},
			{oneShotMode: true, noItemRequirements: true, startWithAllCards: true},
		)
	})
})
