import assert from 'assert'
import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {ObserverComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test `row.hooks.onKnockOut` hook', () => {
	test('Test `row.hooks.onKnockOut` hook', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					let hookHasBeenCalled = false

					let observer = game.components.new(
						ObserverComponent,
						game.currentPlayer.entity,
					)

					let row = game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(0),
					)
					assert(row)

					observer.subscribe(row?.hooks.onKnockOut, () => {
						hookHasBeenCalled = true
					})

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					/** Play two hermits to prevent the game from finishing before the tests finish */
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

					expect(hookHasBeenCalled).toBeTruthy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, oneShotMode: true},
		)
	})
})
