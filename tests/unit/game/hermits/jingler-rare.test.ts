import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import JinglerRare from 'common/cards/hermits/jingler-rare'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Jingler Rare', () => {
	test('Test Jingler forces opponent to discard one card', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [JinglerRare],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(JinglerRare, 'hermit', 0)
					await test.attack('secondary')

					await test.pick(
						query.slot.hand,
						query.slot.opponent,
						query.not(query.slot.empty),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test("Test Jingler does nothing when opponent's hand is empty", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [JinglerRare],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(JinglerRare, 'hermit', 0)
					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
