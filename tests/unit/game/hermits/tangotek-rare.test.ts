import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import FarmerBeefRare from 'common/cards/hermits/farmerbeef-rare'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import CurseOfBinding from 'common/cards/single-use/curse-of-binding'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Tango Extra Flee', () => {
	test('Both players change active hermits', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon],
				playerTwoDeck: [TangoTekRare, FarmerBeefRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(TangoTekRare, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefRare, 'hermit', 1)

					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(2)

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(1)

					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.currentPlayer.activeRow?.index).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Both players can not change active hermit with 0 afk', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [TangoTekRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(TangoTekRare, 'hermit', 0)

					await test.attack('secondary')

					expect(game.state.pickRequests).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Curse of Binding prevents Tango from fleeing', async () => {
		await testGame(
			{
				playerOneDeck: [TangoTekRare, FarmerBeefRare],
				playerTwoDeck: [EthosLabCommon, CurseOfBinding],
				testGame: async (test, game) => {
					await test.playCardFromHand(TangoTekRare, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefRare, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(CurseOfBinding, 'single_use')

					await test.applyEffect()

					await test.endTurn()

					await test.attack('secondary')

					expect(game.state.pickRequests).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Betrayal effect does not prevent Tango from fleeing', async () => {
		await testGame(
			{
				playerOneDeck: [TangoTekRare, FarmerBeefRare],
				playerTwoDeck: [HumanCleoRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(TangoTekRare, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefRare, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)

					await test.attack('secondary')

					await test.endTurn()

					await test.attack('secondary')

					// First request should be for Betrayal target
					expect(game.state.pickRequests).toHaveLength(1)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					// Second request should be to switch active row
					expect(game.state.pickRequests).toHaveLength(1)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.currentPlayer.activeRow?.index).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
