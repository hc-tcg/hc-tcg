import {describe, expect, test} from '@jest/globals'
import {GoldArmor} from 'common/cards/attach/armor'
import {Thorns} from 'common/cards/attach/thorns'
import Totem from 'common/cards/attach/totem'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SkizzlemanRare from 'common/cards/hermits/skizzleman-rare'
import Anvil from 'common/cards/single-use/anvil'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Skizzleman Rare', () => {
	test('Gaslight works as intended', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							SkizzlemanRare.secondary.damage -
							30 /* Anvil damage */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - 20 /* Gaslight */ - 10 /* Anvil damage */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Gaslight only triggers Thorns once', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Thorns, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(SkizzlemanRare.health - 20 /* Thorns damage */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test("Gaslight doesn't trigger if the hermit takes no damage", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, GoldArmor],
				playerTwoDeck: [SkizzlemanRare, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(GoldArmor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					// Use anvil to trigger attack the afk hermit for zero damage
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Totem keeps hermits alive when damaged by Gaslight and Burn at end of turn', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					Totem,
					Totem,
				],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, LavaBucket, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(Totem, 'attach', 0)
					await test.playCardFromHand(Totem, 'attach', 2)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 1)
					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					// Manually set Etho (1) health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 20
					// Manually set Etho (3) health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(2),
					)!.health = 30

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(10) // Check Burn -> Gas Light
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(10) // Check Anvil -> Gas Light + Burn
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
