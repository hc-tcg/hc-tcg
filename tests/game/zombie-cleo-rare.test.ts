import {describe, test, expect} from '@jest/globals'
import {attack, endTurn, findCardInHand, playCard, testGame} from './utils'
import ZombieCleoRare from 'common/cards/default/hermits/zombiecleo-rare'
import {GameModel} from 'common/models/game-model'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'

function* testPrimaryDoesNotCrash(game: GameModel) {
	yield* playCard(
		game,
		findCardInHand(game.currentPlayer, ZombieCleoRare),
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.hermit,
		)!,
	)

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

	yield* endTurn(game)

	yield* attack(game, 'primary')

	expect(
		game.components.find(
			RowComponent,
			query.row.active,
			query.row.opponentPlayer,
		)?.health,
	).not.toEqual(EthosLabCommon.health)
}

describe('Test Zombie Cleo', () => {
	test('Test Zombie Cleo Primary Does Not Crash Server', () => {
		testGame(
			{
				saga: testPrimaryDoesNotCrash,
				playerOneDeck: [ZombieCleoRare],
				playerTwoDeck: [EthosLabCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
