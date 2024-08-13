import {GameModel} from 'common/models/game-model'
import test, {describe} from 'node:test'
import {attack, endTurn, findCardInHand, playCard, testGame} from './utils'
import Loyalty from 'common/cards/default/effects/loyalty'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import BalancedItem from 'common/cards/default/items/balanced-common'
import query from 'common/components/query'
import {SlotComponent} from 'common/components'

function* testLoyaltyHelperSaga(game: GameModel) {
	playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.row(query.row.index(0)),
		)!,
	)

	playCard(
		game,
		findCardInHand(game.currentPlayer, Loyalty),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.attach,
			query.slot.row(query.row.index(0)),
		)!,
	)

	playCard(
		game,
		findCardInHand(game.currentPlayer, BalancedItem),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
			query.slot.row(query.row.hasHermit),
		)!,
	)

	endTurn(game)

	playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
		)!,
	)

	endTurn(game)

	playCard(
		game,
		findCardInHand(game.currentPlayer, EthosLabCommon),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
			query.slot.row(query.row.index(1)),
		)!,
	)

	playCard(
		game,
		findCardInHand(game.currentPlayer, BalancedItem),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
			query.slot.row(query.row.index(1)),
		)!,
	)

	endTurn(game)

	attack(game, 'primary')
}

describe('Test Clock', () => {
	test('Test Clock', function* () {
		testGame({
			saga: testLoyaltyHelperSaga,
			playerOneDeck: [EthosLabCommon, Loyalty, BalancedItem, BalancedItem],
			playerTwoDeck: [EthosLabCommon],
		})
	})
})
