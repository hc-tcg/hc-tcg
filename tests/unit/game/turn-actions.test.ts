import {describe, expect, test} from '@jest/globals'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import {IronSword} from 'common/cards/single-use/sword'
import Fortune from 'common/cards/single-use/fortune'
import Totem from 'common/cards/attach/totem'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import {testGame} from './utils'

describe('Test Standard Turn Actions', () => {
	test('Test Starting Turn Actions & Play Item', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Totem, BalancedItem, BalancedItem],
				playerTwoDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Totem, BalancedItem, BalancedItem],
				testGame: async (test, game) => {
					expect(game.state.turn.availableActions).toEqual(["PLAY_HERMIT_CARD"])
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD",])
					await test.endTurn()

					expect(game.state.turn.availableActions).toEqual(["PLAY_HERMIT_CARD"])
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD"])
					await test.endTurn()
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Main Attacks Availability and Blocking', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Totem, BalancedItem, BalancedItem, BalancedItem],
				playerTwoDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Totem, BalancedDoubleItem, BalancedDoubleItem, BalancedDoubleItem],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD"])
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD"])
					await test.endTurn()

					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.playCardFromHand(BalancedItem, 'item', 0, 1)
					await test.endTurn()

					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 1)
					await test.endTurn()

					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.attack('primary')
					expect(game.state.turn.availableActions).toEqual(["END_TURN"])
					await test.endTurn()

					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.attack('secondary')
					expect(game.state.turn.availableActions).toEqual(["END_TURN"])
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Hard Switch', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Totem, BalancedDoubleItem, BalancedDoubleItem],
				playerTwoDeck: [VintageBeefCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					await test.changeActiveHermit(1)
					expect(game.state.turn.availableActions).toEqual(["END_TURN"])
					await test.endTurn()

					await test.endTurn()

					// See the Double Piston Extender bug.
					await test.changeActiveHermit(0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN"])
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Apply Single Use', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Fortune, Totem, BalancedDoubleItem, BalancedDoubleItem],
				playerTwoDeck: [VintageBeefCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Fortune, 'single_use')
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "REMOVE_EFFECT", "APPLY_EFFECT"])
					await test.applyEffect()
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Single Use Attack', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, IronSword, Fortune, Totem, BalancedDoubleItem, BalancedDoubleItem],
				playerTwoDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, IronSword, Fortune, Totem, BalancedDoubleItem],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(IronSword, 'single_use')
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "REMOVE_EFFECT", "CHANGE_ACTIVE_HERMIT", "SINGLE_USE_ATTACK", "PLAY_HERMIT_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.attack('single-use')
					expect(game.state.turn.availableActions).toEqual(["END_TURN"])
					await test.endTurn()

					await test.playCardFromHand(IronSword, 'single_use')
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "REMOVE_EFFECT", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "SINGLE_USE_ATTACK", "PLAY_HERMIT_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.attack('single-use')
					expect(game.state.turn.availableActions).toEqual(["END_TURN"])
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Attaching', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Totem, Totem, BalancedDoubleItem, BalancedDoubleItem],
				playerTwoDeck: [VintageBeefCommon, VintageBeefCommon, VintageBeefCommon, IronSword, Fortune, Totem, Totem, Totem, BalancedDoubleItem, BalancedDoubleItem],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					await test.playCardFromHand(Totem, 'attach', 0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.endTurn()

					await test.playCardFromHand(Totem, 'attach', 0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_ITEM_CARD"])
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_EFFECT_CARD", "PLAY_ITEM_CARD"])
					await test.playCardFromHand(Totem, 'attach', 0)
					expect(game.state.turn.availableActions).toEqual(["END_TURN", "CHANGE_ACTIVE_HERMIT", "PRIMARY_ATTACK", "SECONDARY_ATTACK", "PLAY_HERMIT_CARD", "PLAY_SINGLE_USE_CARD", "PLAY_ITEM_CARD"])
				},
			},
			{startWithAllCards: true},
		)
	})
})
