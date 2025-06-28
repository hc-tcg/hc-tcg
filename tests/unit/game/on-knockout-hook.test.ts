import assert from 'assert'
import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {ObserverComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from './utils'

describe('Test `row.hooks.onKnockOut` hook', () => {
	test('Test `row.hooks.onKnockOut` hook', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
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

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					/** Play two hermits to prevent the game from finishing before the tests finish */
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')

					expect(hookHasBeenCalled).toBeTruthy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, oneShotMode: true},
		)
	})
})
