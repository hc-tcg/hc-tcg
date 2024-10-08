import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import ChainmailArmor from 'common/cards/attach/chainmail-armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import RendogRare from 'common/cards/hermits/rendog-rare'
import TinFoilChefUltraRare from 'common/cards/hermits/tinfoilchef-ultra-rare'
import Chest from 'common/cards/single-use/chest'
import Ladder from 'common/cards/single-use/ladder'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Ultra Rare TFC "Take It Easy"', () => {
	test('Can not discard two attach effects from the same hermit', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)

					yield* endTurn(game)

					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

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

	test('Can not discard twice after hermit swaps rows with Ladder', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ChainmailArmor,
					ChainmailArmor,
					Ladder,
				],
				playerTwoDeck: [TinFoilChefUltraRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)

					yield* endTurn(game)

					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

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

	test('Can discard from the same hermit after they are knocked-out', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ChainmailArmor,
					Chest,
					ChainmailArmor,
				],
				playerTwoDeck: [TinFoilChefUltraRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)

					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* playCardFromHand(game, Chest, 'single_use')
					yield* finishModalRequest(game, {
						result: true,
						cards: game.components.filterEntities(
							CardComponent,
							query.card.currentPlayer,
							query.card.is(EthosLabCommon),
							query.card.slot(query.slot.discardPile),
						),
					})

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* changeActiveHermit(game, 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

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

	test('Can discard from the same hermit after TFC is knocked-out', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare, ArmorStand, Chest],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					yield* playCardFromHand(game, ArmorStand, 'hermit', 1)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* playCardFromHand(game, Chest, 'single_use')
					yield* finishModalRequest(game, {
						result: true,
						cards: game.components.filterEntities(
							CardComponent,
							query.card.currentPlayer,
							query.card.is(TinFoilChefUltraRare),
							query.card.slot(query.slot.discardPile),
						),
					})

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					yield* changeActiveHermit(game, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')

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

	test('Different TFC can discard from the same hermit', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare, TinFoilChefUltraRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 1)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					yield* endTurn(game)

					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

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

	test('Can not discard twice when used by/facing Role Play', () => {
		testGame(
			{
				playerOneDeck: [RendogRare, ChainmailArmor, ChainmailArmor],
				playerTwoDeck: [TinFoilChefUltraRare, ChainmailArmor, ChainmailArmor],
				saga: function* (game) {
					yield* playCardFromHand(game, RendogRare, 'hermit', 0)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					yield* endTurn(game)

					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.active,
						query.slot.hermit,
					)
					yield* finishModalRequest(game, {pick: 'secondary'})

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						)?.props,
					).toBe(ChainmailArmor)
					yield* endTurn(game)

					yield* playCardFromHand(game, ChainmailArmor, 'attach', 0)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.active,
							query.card.slot(query.slot.attach),
						),
					).not.toBe(null)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.active,
						query.slot.hermit,
					)
					yield* finishModalRequest(game, {pick: 'secondary'})

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
