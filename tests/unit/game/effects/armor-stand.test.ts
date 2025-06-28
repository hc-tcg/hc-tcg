import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {SlotComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Armor Stand', () => {
	test("Armor stand doesn't give a prize card", async () => {
		await testGame(
			{
				playerOneDeck: [ArmorStand, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(game.currentPlayer.lives).toBe(3)
					expect(game.currentPlayer.activeRow).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Armor stand disables correct slots', async () => {
		await testGame(
			{
				playerOneDeck: [ArmorStand],
				playerTwoDeck: [],
				testGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)

					for (const slot of game.components.filter(
						SlotComponent,
						query.slot.frozen,
					)) {
						expect(['item', 'attach']).toContain(slot.type)
						expect(slot.player.entity).toBe(game.currentPlayerEntity)
						expect(slot.inRow() && slot.row.index).toBe(0)
					}
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
