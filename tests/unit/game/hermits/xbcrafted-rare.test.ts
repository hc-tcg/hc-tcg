import {describe, expect, test} from '@jest/globals'
import {DiamondArmor, IronArmor} from 'common/cards/attach/armor'
import LightningRod from 'common/cards/attach/lightning-rod'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import XBCraftedRare from 'common/cards/hermits/xbcrafted-rare'
import {IronSword} from 'common/cards/single-use/sword'
import TargetBlock from 'common/cards/single-use/target-block'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {IgnoreAttachSlotEffect} from 'common/status-effects/ignore-attach'
import {testGame} from '../utils'

describe('Test xB', () => {
	test('Test "Noice!" functions with type advantage and single use attacks', async () => {
		await testGame(
			{
				playerOneDeck: [GeminiTayCommon, DiamondArmor],
				playerTwoDeck: [XBCraftedRare, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.playCardFromHand(DiamondArmor, 'attach', 0)

					await test.endTurn()

					await test.playCardFromHand(XBCraftedRare, 'hermit', 0)
					await test.playCardFromHand(IronSword, 'single_use')

					await test.attack('secondary')

					// We expect that the diamond armor attached to Gem did not block any damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(
						GeminiTayCommon.health -
							XBCraftedRare.secondary.damage -
							20 /* Explorer -> Builder type advantage */ -
							20 /* Iron Sword*/,
					)

					await test.endTurn()

					// We expect that the diamond armor attached to Gem to no longer be disabled.
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(IgnoreAttachSlotEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBeFalsy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test "Noice!" ignores Lightning Rod.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [XBCraftedRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(XBCraftedRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - XBCraftedRare.secondary.damage)
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
	test('Test "Noice!" ignores Lightning Rod when using single use.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [XBCraftedRare, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(XBCraftedRare, 'hermit', 0)
					await test.playCardFromHand(IronSword, 'single_use')
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
							XBCraftedRare.secondary.damage -
							20 /* Iron Sword */,
					)
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
	test('Test "Noice!" ignores attachables with Target Block.', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, IronArmor],
				playerTwoDeck: [XBCraftedRare, TargetBlock],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(IronArmor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(XBCraftedRare, 'hermit', 0)
					await test.playCardFromHand(TargetBlock, 'single_use')
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.opponent,
						query.slot.hermit,
					)

					await test.endTurn()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - XBCraftedRare.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
