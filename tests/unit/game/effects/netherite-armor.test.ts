import {describe, expect, test} from '@jest/globals'
import {NetheriteArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Egg from 'common/cards/single-use/egg'
import {DiamondSword} from 'common/cards/single-use/sword'
import TargetBlock from 'common/cards/single-use/target-block'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Netherite Armor', () => {
	test('Netherite Armor prevents damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(NetheriteArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Netherite Armor prevents knockback', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(NetheriteArmor, 'attach', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('primary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Netherite Armor prevents damage from effects', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, DiamondSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(NetheriteArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(DiamondSword, 'single_use')
					await test.attack('primary')

					expect(
						game.components.find(
							RowComponent,
							query.row.index(0),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - (EthosLabCommon.primary.damage - 20))
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Netherite Armor does not protect against redirects', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(NetheriteArmor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(TargetBlock, 'single_use')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.attack('primary')

					expect(
						game.components.find(
							RowComponent,
							query.row.index(0),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.index(1),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - (EthosLabCommon.primary.damage - 20))
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
