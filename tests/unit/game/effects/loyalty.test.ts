import {describe, expect, test} from '@jest/globals'
import Loyalty from 'common/cards/attach/loyalty'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import {GameModel} from 'common/models/game-model'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

function* testLoyaltyHelperSaga(game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.playCardFromHand(Loyalty, 'attach', 0)
	await test.playCardFromHand(BalancedItem, 'item', 0, 0)

	yield* endTurn(game)

	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

	yield* endTurn(game)

	await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
	await test.playCardFromHand(BalancedItem, 'item', 1, 0)

	yield* endTurn(game)

	await test.attack('primary')

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
