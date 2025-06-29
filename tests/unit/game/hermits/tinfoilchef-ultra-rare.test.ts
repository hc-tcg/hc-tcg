import {describe, expect, test} from '@jest/globals'
import {ChainmailArmor} from 'common/cards/attach/armor'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import RendogRare from 'common/cards/hermits/rendog-rare'
import TinFoilChefUltraRare from 'common/cards/hermits/tinfoilchef-ultra-rare'
import Chest from 'common/cards/single-use/chest'
import Ladder from 'common/cards/single-use/ladder'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Ultra Rare TFC "Take It Easy"', () => {
	test('Can not discard two attach effects from the same hermit', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)

					await test.endTurn()

					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						)?.props,
					).toBe(ChainmailArmor)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Can not discard twice after hermit swaps rows with Ladder', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ChainmailArmor,
					ChainmailArmor,
					Ladder,
				],
				playerTwoDeck: [TinFoilChefUltraRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.playCardFromHand(ChainmailArmor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)

					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						)?.props,
					).toBe(ChainmailArmor)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Can discard from the same hermit after they are knocked-out', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ChainmailArmor,
					Chest,
					ChainmailArmor,
				],
				playerTwoDeck: [TinFoilChefUltraRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)

					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.playCardFromHand(Chest, 'single_use')
					await test.finishModalRequest({
						result: true,
						cards: game.components.filterEntities(
							CardComponent,
							query.card.currentPlayer,
							query.card.is(EthosLabCommon),
							query.card.slot(query.slot.discardPile),
						),
					})

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.changeActiveHermit(0)
					await test.endTurn()

					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Can discard from the same hermit after TFC is knocked-out', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare, ArmorStand, Chest],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 0)
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.playCardFromHand(Chest, 'single_use')
					await test.finishModalRequest({
						result: true,
						cards: game.components.filterEntities(
							CardComponent,
							query.card.currentPlayer,
							query.card.is(TinFoilChefUltraRare),
							query.card.slot(query.slot.discardPile),
						),
					})

					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 0)
					await test.changeActiveHermit(0)
					await test.endTurn()

					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Different TFC can discard from the same hermit', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare, TinFoilChefUltraRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 0)
					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 1)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					await test.endTurn()

					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Can not discard twice when used by/facing Role Play', async () => {
		await testGame(
			{
				playerOneDeck: [RendogRare, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare, ChainmailArmor, ChainmailArmor],
				testGame: async (test, game) => {
					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(TinFoilChefUltraRare, 'hermit', 0)
					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					await test.endTurn()

					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.active,
						query.slot.hermit,
					)
					await test.finishModalRequest({pick: 'secondary'})

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					await test.endTurn()

					await test.playCardFromHand(ChainmailArmor, 'attach', 0)
					await test.attack('secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						),
					).not.toBe(null)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.active,
						query.slot.hermit,
					)
					await test.finishModalRequest({pick: 'secondary'})

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
