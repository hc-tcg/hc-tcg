import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FrenchralisRare from 'common/cards/hermits/frenchralis-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Frenchralis Rare', () => {
	test('Test Zero Lives Lost', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [FrenchralisRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(FrenchralisRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - FrenchralisRare.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test One Life Lost', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [FrenchralisRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					game.currentPlayer.lives = 2
					await test.playCardFromHand(FrenchralisRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - FrenchralisRare.secondary.damage - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Test Two Lives Lost', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [FrenchralisRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					game.currentPlayer.lives = 1
					await test.playCardFromHand(FrenchralisRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - FrenchralisRare.secondary.damage - 80)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
