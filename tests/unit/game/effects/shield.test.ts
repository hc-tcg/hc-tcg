import {describe, expect, test} from '@jest/globals'
import Shield from 'common/cards/attach/shield'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Shield', () => {
	test('Base Functionality', async () => {
		await await testGame(
			{
				playerOneDeck: [EthosLabCommon, Shield],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Shield, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(EthosLabCommon.secondary.damage - 60) /*shield*/,
					)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.opponent,
							query.slot.attach,
							query.slot.rowIndex(0),
						)?.card,
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
