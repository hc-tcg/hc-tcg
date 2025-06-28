import {describe, expect, test} from '@jest/globals'
import {DiamondArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {DiamondSword} from 'common/cards/single-use/sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test Diamond Armor', () => {
	test('Diamond Armor prevents damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [EthosLabCommon],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(DiamondArmor, 'attach', 0)
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
	test('Diamond Armor prevents effect damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [EthosLabCommon, DiamondSword],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(DiamondArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(DiamondSword, 'single_use')
					await test.attack('primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 20 - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
