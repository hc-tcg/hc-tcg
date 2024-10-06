import {describe, expect, test} from '@jest/globals'
import Cat from 'common/cards/advent-of-tcg/effects/cat'
import Loyalty from 'common/cards/default/effects/loyalty'
import Shield from 'common/cards/default/effects/shield'
import Thorns from 'common/cards/default/effects/thorns'
import Totem from 'common/cards/default/effects/totem'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GrianRare from 'common/cards/default/hermits/grian-rare'
import BalancedItem from 'common/cards/default/items/balanced-common'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {
	attack,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Grian Rare', () => {
	test('Test Borrow steals Loyalty after knock out', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Loyalty, BalancedItem],
				playerTwoDeck: [GrianRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Loyalty, 'attach', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* attack(game, 'primary')

					// Check Loyalty worked
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([BalancedItem])

					// Check Grian added a modal request that allows attaching Loyalty
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBeTruthy()

					yield* finishModalRequest(game, {result: true, cards: null})

					expect(
						game.components.find(
							CardComponent,
							query.card.is(Loyalty),
							query.card.currentPlayer,
							query.card.active,
						),
					).not.toBe(null)
				},
			},
			{
				startWithAllCards: true,
				noItemRequirements: true,
				forceCoinFlip: true,
				oneShotMode: true,
			},
		)
	})
	test('Test Borrow steals Shield after blocking damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Shield],
				playerTwoDeck: [GrianRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Shield, 'attach', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* attack(game, 'primary')

					// Check Shield blocked Borrow damage
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					// Check Grian added a modal request that allows attaching Shield
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBeTruthy()

					yield* finishModalRequest(game, {result: true, cards: null})

					expect(
						game.components.find(
							CardComponent,
							query.card.is(Shield),
							query.card.currentPlayer,
							query.card.active,
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

	test('Test Borrow cannot steal Totem that revives hermit', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [GrianRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Totem, 'attach', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* attack(game, 'primary')

					// Check for Totem reviving hermit and discarding itself
					expect(game.opponentPlayer.activeRow?.health).toBe(10)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Totem),
							query.card.opponentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
					// Check Grian does not create a modal request
					expect(game.state.modalRequests).toStrictEqual([])
				},
			},
			{
				startWithAllCards: true,
				noItemRequirements: true,
				forceCoinFlip: true,
				oneShotMode: true,
			},
		)
	})

	test("Test Borrow discards to Grian's discard pile", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Loyalty],
				playerTwoDeck: [GrianRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Loyalty, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* attack(game, 'primary')

					yield* finishModalRequest(game, {result: false, cards: null})

					expect(
						game.components.find(
							CardComponent,
							query.card.is(Loyalty),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
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

	test("Test Borrow cannot replace card in Grian's attach slot", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Loyalty],
				playerTwoDeck: [GrianRare, Shield],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Loyalty, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* playCardFromHand(game, Shield, 'attach', 0)
					yield* attack(game, 'primary')

					// Check Grian added a modal request that does not allow attaching
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBe(null)

					yield* finishModalRequest(game, {result: false, cards: null})

					expect(
						game.components.find(
							CardComponent,
							query.card.is(Loyalty),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
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

	test('Test Borrow cannot attach card when Grian is knocked-out by Thorns', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Thorns],
				playerTwoDeck: [GrianRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Thorns, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					// Manually set Grian's health to knock-out range
					game.currentPlayer.activeRow!.health = 10

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'primary')

					// Check Grian added a modal request that does not allow attaching
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBe(null)

					yield* finishModalRequest(game, {result: false, cards: null})

					expect(
						game.components.find(
							CardComponent,
							query.card.is(Thorns),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
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

	test('Test Borrow does not trigger Cat when attached after flipping heads', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Cat, Loyalty],
				playerTwoDeck: [GrianRare, ...Array(10).fill(BalancedItem)],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* attack(game, 'primary')
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Cat),
							query.card.currentPlayer,
							query.card.active,
						),
					).not.toBe(null)
					yield* endTurn(game)

					yield* playCardFromHand(game, Loyalty, 'attach', 0)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					expect(game.state.modalRequests).toHaveLength(2)
					yield* finishModalRequest(game, {result: false, cards: null})
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* endTurn(game)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
