import {describe, expect, test} from '@jest/globals'
import {DiamondArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import {IronSword} from 'common/cards/single-use/sword'
import {DiamondSword} from 'common/cards/single-use/sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Diamond Armor', () => {
	test('Diamond Armor prevents damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
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
	test('Diamond Armor prevents effect damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [EthosLabCommon, DiamondSword],
				testGame: async (test, game) => {
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
	test('Diamond Armor prevents extra effect damage collectively', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, DiamondArmor],
				playerTwoDeck: [GeminiTayRare, IronSword, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(DiamondArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('secondary')
					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('single-use')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - GeminiTayRare.secondary.damage) // (80[secondary] - 20[block]) + (20[ISword] - 20[eblock]) + 20[ISword] damage
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
