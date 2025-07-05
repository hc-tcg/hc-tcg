import {describe, expect, test} from '@jest/globals'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import PixlriffsRare from 'common/cards/advent-of-tcg/hermits/pixlriffs-rare'
import {Thorns} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import RendogRare from 'common/cards/hermits/rendog-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import Ladder from 'common/cards/single-use/ladder'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {WEAKNESS_DAMAGE} from 'common/const/damage'
import {testGame} from '../../utils'

describe('Test Pixl World Build', () => {
	test('World Build Functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [PixlriffsRare, PixlriffsRare, EnderPearl, Ladder],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(PixlriffsRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - PixlriffsRare.secondary.damage)
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - PixlriffsRare.secondary.damage - 40)
					await test.endTurn()

					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - PixlriffsRare.secondary.damage - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Does not deal extra damage if hermit was activated by backlash KO', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [PixlriffsRare, PixlriffsRare, EnderPearl],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PixlriffsRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(EnderPearl, 'single_use')
					// Manually set Pixl health to be KO'd by Ender Pearl
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.changeActiveHermit(1)
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - PixlriffsRare.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	// Test interactions with Grianch which allows two attacks in one turn
	test('Deals extra damage when swapped with Ladder and activated by backlash KO', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, Thorns],
				playerTwoDeck: [EthosLabCommon, PixlriffsRare, BadOmen, Ladder],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(Thorns, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					// Manually set Etho health to be KO'd by Thorns
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10
					await test.attack('primary')

					await test.changeActiveHermit(0)
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							EthosLabCommon.primary.damage -
							PixlriffsRare.secondary.damage -
							40 -
							WEAKNESS_DAMAGE /** Explorer -> Builder */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Deals extra damage when hermit moves and returns to same row using two Ladders', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, PixlriffsRare, GeminiTayRare],
				playerTwoDeck: [RendogRare, RendogRare, BadOmen, Ladder, Ladder],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(RendogRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GrianchRare.health - GeminiTayRare.secondary.damage)

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							GeminiTayRare.secondary.damage -
							PixlriffsRare.secondary.damage -
							40,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Deals extra damage when hermit moves and returns to same row using two Ender Pearls', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, PixlriffsRare, GeminiTayRare],
				playerTwoDeck: [RendogRare, BadOmen, EnderPearl, EnderPearl],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GrianchRare.health - GeminiTayRare.secondary.damage)

					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							GeminiTayRare.secondary.damage -
							PixlriffsRare.secondary.damage -
							40,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Deals extra damage when hermit moves and returns to same row using Ender Pearl + Jumpscare', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, PixlriffsRare, PoePoeSkizzRare],
				playerTwoDeck: [RendogRare, BadOmen, EnderPearl],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(RendogRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GrianchRare.health - PoePoeSkizzRare.secondary.damage)

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							PoePoeSkizzRare.secondary.damage -
							PixlriffsRare.secondary.damage -
							40,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
