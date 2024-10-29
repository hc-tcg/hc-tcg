import {describe, expect, test} from '@jest/globals'
import {GoldArmor} from 'common/cards/attach/armor'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import WelsknightRare from 'common/cards/hermits/welsknight-rare'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test rare welsknight', () => {
	test('Vengance functionality', () => {
		testGame(
			{
				playerOneDeck: [GeminiTayCommon, GoldArmor, InstantHealthII],
				playerTwoDeck: [WelsknightRare],
				saga: function* (game) {
					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, WelsknightRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GeminiTayCommon.health - WelsknightRare.secondary.damage)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GeminiTayCommon.health -
							WelsknightRare.secondary.damage -
							(WelsknightRare.secondary.damage +
								20) /*extra damage from wels being in yellow*/,
					)

					//make it possible to survive 140 damage
					yield* playCardFromHand(game, InstantHealthII, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* playCardFromHand(game, GoldArmor, 'attach', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GeminiTayCommon.health -
							WelsknightRare.secondary.damage -
							(WelsknightRare.secondary.damage +
								20) /*extra damage from wels being in yellow*/ +
							60 /*splash potion of healing*/ -
							(WelsknightRare.secondary.damage +
								40 /*extra damage from wels being in red*/ -
								10) /*gold armor protection*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
