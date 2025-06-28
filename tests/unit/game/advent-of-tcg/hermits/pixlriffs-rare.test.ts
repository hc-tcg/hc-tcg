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
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Pixl World Build', () => {
	test('World Build Functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [PixlriffsRare, PixlriffsRare, EnderPearl, Ladder],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

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
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					await test.playCardFromHand(EnderPearl, 'single_use')
					yield* pick(
						game,
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
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					await test.playCardFromHand(Ladder, 'single_use')
					yield* pick(
						game,
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

	test('Does not deal extra damage if hermit was activated by backlash KO', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [PixlriffsRare, PixlriffsRare, EnderPearl],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(PixlriffsRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(EnderPearl, 'single_use')
					// Manually set Pixl health to be KO'd by Ender Pearl
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* changeActiveHermit(game, 1)
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
	test('Deals extra damage when swapped with Ladder and activated by backlash KO', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, Thorns],
				playerTwoDeck: [EthosLabCommon, PixlriffsRare, BadOmen, Ladder],
				saga: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(Thorns, 'attach', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.playCardFromHand(Ladder, 'single_use')
					yield* pick(
						game,
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

					yield* changeActiveHermit(game, 0)
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

	test('Deals extra damage when hermit moves and returns to same row using two Ladders', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, PixlriffsRare, GeminiTayRare],
				playerTwoDeck: [RendogRare, RendogRare, BadOmen, Ladder, Ladder],
				saga: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 2)
					yield* endTurn(game)

					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(RendogRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.playCardFromHand(Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GrianchRare.health - GeminiTayRare.secondary.damage)

					await test.playCardFromHand(Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
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

	test('Deals extra damage when hermit moves and returns to same row using two Ender Pearls', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, PixlriffsRare, GeminiTayRare],
				playerTwoDeck: [RendogRare, BadOmen, EnderPearl, EnderPearl],
				saga: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 2)
					yield* endTurn(game)

					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.playCardFromHand(EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GrianchRare.health - GeminiTayRare.secondary.damage)

					await test.playCardFromHand(EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
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

	test('Deals extra damage when hermit moves and returns to same row using Ender Pearl + Jumpscare', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, PixlriffsRare, PoePoeSkizzRare],
				playerTwoDeck: [RendogRare, BadOmen, EnderPearl],
				saga: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(PixlriffsRare, 'hermit', 1)
					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 2)
					yield* endTurn(game)

					await test.playCardFromHand(RendogRare, 'hermit', 1)
					await test.playCardFromHand(BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.playCardFromHand(EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
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
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
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
