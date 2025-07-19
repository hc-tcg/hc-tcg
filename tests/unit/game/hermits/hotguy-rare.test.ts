import {describe, expect, test} from '@jest/globals'
import {ThornsIII} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HotguyRare from 'common/cards/hermits/hotguy-rare'
import RendogRare from 'common/cards/hermits/rendog-rare'
import Bow from 'common/cards/single-use/bow'
import Crossbow from 'common/cards/single-use/crossbow'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Hotguy Rare', () => {
	test('Test Hotguy with Bow', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HotguyRare, Bow],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(HotguyRare, 'hermit', 0)
					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - HotguyRare.secondary.damage)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 80 /* Bow */)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Hotguy with Crossbow', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					/* Thorns is being tested because it was a suspected bugged interacton
					 * https://discord.com/channels/1073763159187390584/1341987170180796487/1341988384783994891 */
					ThornsIII,
				],
				playerTwoDeck: [HotguyRare, Crossbow],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(ThornsIII, 'attach', 2)
					await test.endTurn()

					await test.playCardFromHand(HotguyRare, 'hermit', 0)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							HotguyRare.secondary.damage -
							40 /* Crossbow */,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /* Crossbow */)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /* Crossbow */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Hotguy with type advantage', async () => {
		await testGame(
			{
				playerOneDeck: [RendogRare, RendogRare, RendogRare],
				playerTwoDeck: [HotguyRare, Crossbow],
				testGame: async (test, game) => {
					/** This tests the bug found in https://discord.com/channels/1073763159187390584/1341987170180796487/1352075972245192805 */
					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(RendogRare, 'hermit', 1)
					await test.playCardFromHand(RendogRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(HotguyRare, 'hermit', 0)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						RendogRare.health -
							HotguyRare.secondary.damage -
							40 /* Crossbow */ -
							20 /* Type advantage */,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(RendogRare.health - 40 /* Crossbow */)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(RendogRare.health - 40 /* Crossbow */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
