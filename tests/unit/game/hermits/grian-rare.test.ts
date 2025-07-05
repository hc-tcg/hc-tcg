import {describe, expect, test} from '@jest/globals'
import Loyalty from 'common/cards/attach/loyalty'
import Shield from 'common/cards/attach/shield'
import {Thorns} from 'common/cards/attach/thorns'
import Totem from 'common/cards/attach/totem'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GrianRare from 'common/cards/hermits/grian-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {SelectCards} from 'common/types/modal-requests'
import {testGame} from '../utils'

describe('Test Grian Rare', () => {
	test('Test Borrow steals Loyalty after knock out', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Loyalty, BalancedItem],
				playerTwoDeck: [GrianRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Loyalty, 'attach', 0)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.attack('primary')

					// Check Loyalty worked
					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([BalancedItem])

					// Check Grian added a modal request that allows attaching Loyalty
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBeTruthy()

					await test.finishModalRequest({result: true, cards: null})

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
	test('Test Borrow steals Shield after blocking damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Shield],
				playerTwoDeck: [GrianRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Shield, 'attach', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.attack('primary')

					// Check Shield blocked Borrow damage
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					// Check Grian added a modal request that allows attaching Shield
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBeTruthy()

					await test.finishModalRequest({result: true, cards: null})

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

	test('Test Borrow cannot steal Totem that revives hermit', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [GrianRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Totem, 'attach', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.attack('primary')

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

	test("Test Borrow discards to Grian's discard pile", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Loyalty],
				playerTwoDeck: [GrianRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Loyalty, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.attack('primary')

					await test.finishModalRequest({result: false, cards: null})

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

	test("Test Borrow cannot replace card in Grian's attach slot", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Loyalty],
				playerTwoDeck: [GrianRare, Shield],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Loyalty, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.playCardFromHand(Shield, 'attach', 0)
					await test.attack('primary')

					// Check Grian added a modal request that does not allow attaching
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBe(null)

					await test.finishModalRequest({result: false, cards: null})

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

	test('Test Borrow cannot attach card when Grian is knocked-out by Thorns', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Thorns],
				playerTwoDeck: [GrianRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Thorns, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					// Manually set Grian's health to knock-out range
					game.currentPlayer.activeRow!.health = 10

					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('primary')

					// Check Grian added a modal request that does not allow attaching
					expect(
						(game.state.modalRequests[0] as SelectCards.Request)?.modal
							.primaryButton,
					).toBe(null)

					await test.finishModalRequest({result: false, cards: null})

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
})
