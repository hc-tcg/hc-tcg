import assert from 'assert'
import {describe, test} from '@jest/globals'
import Loyalty from 'common/cards/default/effects/loyalty'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import BalancedItem from 'common/cards/default/items/balanced-common'
import {SlotComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {printBoardState} from 'server/utils'
import {attack, endTurn, findCardInHand, playCard, testGame} from './utils'

function* testLoyaltyHelperSaga(game: GameModel) {
	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.row(query.row.index(0)),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, Loyalty),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.attach,
			query.slot.row(query.row.index(0)),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, BalancedItem),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
			query.slot.row(query.row.hasHermit),
		)!,
	)

	printBoardState(game)

	yield* endTurn(game)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
		)!,
	)

	printBoardState(game)

	yield* endTurn(game)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.row(query.row.index(1)),
		)!,
	)

	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, BalancedItem),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
			query.slot.row(query.row.index(1)),
		)!,
	)

	printBoardState(game)
	yield* endTurn(game)

	yield* attack(game, 'primary')

	yield* endTurn(game)

	printBoardState(game)
	// The player should only have retrieved one item from the game board in there hand.
	// The rest of the cards have been played.
	assert(game.currentPlayer.getHand().length === 1)
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
			{oneShotMode: true},
		)
	})
})