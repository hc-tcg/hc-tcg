import {describe, expect, test} from '@jest/globals'
import BdoubleO100Rare from 'common/cards/hermits/bdoubleo100-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import CurseOfBinding from 'common/cards/single-use/curse-of-binding'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Chorus Fruit', () => {
	test('Basic functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
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

	test('Chorus Fruit can be used to swap after attacking for Betrayed', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [HumanCleoRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)

					await test.attack('secondary')

					await test.endTurn()

					await test.playCardFromHand(ChorusFruit, 'single_use')
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

	test('Curse of Binding prevents using Chorus Fruit', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [EthosLabCommon, CurseOfBinding],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(CurseOfBinding, 'single_use')
					await test.applyEffect()

					await test.endTurn()

					expect(
						game.getPickableSlots(ChorusFruit.attachCondition),
					).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Shreep prevents using Chorus Fruit', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					BdoubleO100Rare,
					EthosLabCommon,
					ChorusFruit,
					ChorusFruit,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BdoubleO100Rare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					expect(game.currentPlayer.singleUseCardUsed).toBe(true)
					expect(game.state.pickRequests).toHaveLength(0)
					await test.endTurn()

					await test.endTurn()

					expect(
						game.getPickableSlots(ChorusFruit.attachCondition),
					).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
