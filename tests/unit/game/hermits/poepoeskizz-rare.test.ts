import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import Bow from 'common/cards/single-use/bow'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	attack,
	endTurn,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../utils'

describe('Test Poe Poe Skizz Rare', () => {
	test('Jumpscare.', () => {
		testGame(
			{
				playerOneDeck: [PoePoeSkizzRare],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				saga: async (test, game) => {
					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - PoePoeSkizzRare.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /* Jumpscare */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Canceling Jumpscare', () => {
		testGame(
			{
				playerOneDeck: [PoePoeSkizzRare, ...Array(4).fill(EthosLabCommon), Bow],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				saga: async (test, game) => {
					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					yield* removeEffect(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 4)
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - PoePoeSkizzRare.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(game.opponentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
