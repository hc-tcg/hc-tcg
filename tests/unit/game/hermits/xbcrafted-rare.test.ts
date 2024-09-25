import {describe, expect, test} from '@jest/globals'
import LightningRod from 'common/cards/alter-egos/effects/lightning-rod'
import TargetBlock from 'common/cards/alter-egos/single-use/target-block'
import DiamondArmor from 'common/cards/default/effects/diamond-armor'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/default/hermits/geminitay-common'
import XBCraftedRare from 'common/cards/default/hermits/xbcrafted-rare'
import IronSword from 'common/cards/default/single-use/iron-sword'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {IgnoreAttachSlotEffect} from 'common/status-effects/ignore-attach'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test xB', () => {
	test('Test "Noice!" functions with type advantage and single use attacks', () => {
		testGame(
			{
				playerOneDeck: [GeminiTayCommon, DiamondArmor],
				playerTwoDeck: [XBCraftedRare, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondArmor, 'attach', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, XBCraftedRare, 'hermit', 0)
					yield* playCardFromHand(game, IronSword, 'single_use')

					yield* attack(game, 'secondary')

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

					yield* endTurn(game)

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
	test('Test "Noice!" does not ignore Lightning Rod.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [XBCraftedRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, XBCraftedRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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
	test('Test "Noice!" does not ignore Lightning Rod when using single use.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [XBCraftedRare, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, XBCraftedRare, 'hermit', 0)
					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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
					).toBe(
						EthosLabCommon.health -
							XBCraftedRare.secondary.damage -
							20 /* Iron Sword */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test "Noice!" does not ignore Target Block.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [XBCraftedRare, TargetBlock],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, XBCraftedRare, 'hermit', 0)
					yield* playCardFromHand(game, TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.opponent,
						query.slot.hermit,
					)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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
