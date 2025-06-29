import {describe, expect, test} from '@jest/globals'
import {GoldArmor} from 'common/cards/attach/armor'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import WelsknightRare from 'common/cards/hermits/welsknight-rare'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test rare welsknight', () => {
	test('Vengance functionality', async () => {
		await testGame(
			{
				playerOneDeck: [GeminiTayCommon, GoldArmor, InstantHealthII],
				playerTwoDeck: [WelsknightRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(WelsknightRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GeminiTayCommon.health - WelsknightRare.secondary.damage)

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

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
					await test.playCardFromHand(InstantHealthII, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.playCardFromHand(GoldArmor, 'attach', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

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
