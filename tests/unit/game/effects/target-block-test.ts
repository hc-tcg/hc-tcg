import {describe, expect, test} from '@jest/globals'
import TargetBlockEffect from 'common/cards/single-use/target-block'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Target Block', () => {
	test('Test Target Block Has Delayed Action (and Works)', async () => {
		await testGame(
			{
				playerOneDeck: [GeminiTayRare, GeminiTayRare],
				playerTwoDeck: [GeminiTayRare, TargetBlockEffect],
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(TargetBlockEffect, 'single_use')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('primary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GeminiTayRare.health - GeminiTayRare.primary.damage)

					await test.endTurn()

					await test.attack('primary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(GeminiTayRare.health - GeminiTayRare.primary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Target Block Disallowing Single Use Cards Next Turn (and Gem does not reallow it)', async () => {
		await testGame(
			{
				playerOneDeck: [GeminiTayRare, GeminiTayRare],
				playerTwoDeck: [GeminiTayRare, TargetBlockEffect, TargetBlockEffect],
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(TargetBlockEffect, 'single_use')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')

					expect(
						expect(game.currentPlayer.getCardsCanBePlacedIn()).not.toStrictEqual([])
					)

					await test.endTurn()

					await test.endTurn()

					expect(
						expect(game.currentPlayer.getCardsCanBePlacedIn()).toStrictEqual([])
					)

					await test.attack('secondary')

					expect(
						expect(game.currentPlayer.getCardsCanBePlacedIn()).toStrictEqual([])
					)
				},
			},
			{ startWithAllCards: true, noItemRequirements: true },
		)
	})
})
