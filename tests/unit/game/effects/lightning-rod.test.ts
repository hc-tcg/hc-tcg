import {describe, expect, test} from '@jest/globals'
import LightningRod from 'common/cards/attach/lightning-rod'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import PrincessGemRare from 'common/cards/hermits/princessgem-rare'
import Bow from 'common/cards/single-use/bow'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import TargetBlock from 'common/cards/single-use/target-block'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Lightning Rod', () => {
	test('Test redirecting multiple attacks at once', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					LightningRod,
				],
				playerTwoDeck: [EthosLabCommon, Bow],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(LightningRod, 'attach', 2)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('primary')
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
					).toBe(EthosLabCommon.health)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.primary.damage -
							40 /*bow damage*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Lightning Rod is not discarded when overridden', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
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
							CardComponent,
							query.card.is(LightningRod),
							query.card.opponentPlayer,
							query.card.afk,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Lightning Rod is not discarded from missed attacks', async () => {
		// Practically includes 0-damage atttacks.
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					LightningRod,
					InvisibilityPotion,
				],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')

					await test.applyEffect()

					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('primary')

					await test.endTurn()

					expect(
						game.components.find(
							CardComponent,
							query.card.is(LightningRod),
							query.card.currentPlayer,
							query.card.afk,
						),
					).not.toBe(null)
				},
			},
			{
				startWithAllCards: true,
				noItemRequirements: true,
				forceCoinFlip: true,
			},
		)
	})
	test('Rod discards from 0 damage due to Royal Protection', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, PrincessGemRare, LightningRod],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(PrincessGemRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)

					await test.attack('secondary')

					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.endTurn()

					await test.attack('primary')

					await test.endTurn()

					expect(
						game.components.find(
							CardComponent,
							query.card.is(LightningRod),
							query.card.currentPlayer,
							query.card.afk,
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
