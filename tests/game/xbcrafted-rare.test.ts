import {describe, expect, test} from '@jest/globals'
import DiamondArmor from 'common/cards/default/effects/diamond-armor'
import GeminiTayCommon from 'common/cards/default/hermits/geminitay-common'
import XBCraftedRare from 'common/cards/default/hermits/xbcrafted-rare'
import IronSword from 'common/cards/default/single-use/iron-sword'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {IgnoreAttachSlotEffect} from 'common/status-effects/ignore-attach'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

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
							70 /* xB Secondary */ -
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
})
