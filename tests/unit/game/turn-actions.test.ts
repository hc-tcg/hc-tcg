import {describe, expect, test} from '@jest/globals'
import Totem from 'common/cards/attach/totem'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import Fortune from 'common/cards/single-use/fortune'
import {IronSword} from 'common/cards/single-use/sword'
import {mockGame} from './utils'

describe('Test Standard Turn Actions', () => {
	test('Test Starting Turn Actions & Play Item', async () => {
		await mockGame(
			{
				playerOneDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					BalancedItem,
					BalancedItem,
				],
				mockGame: async (test, game) => {
					// [TURN 0] //
					// You can only start with playing a hermit card.
					expect(game.state.turn.availableActions).toEqual(['PLAY_HERMIT_CARD'])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					// Everything now unlocks.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					// You can play 1 item per turn, but cannot attack on the first turn.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
					])
					expect(game.state.turn.completedActions).toEqual(['PLAY_ITEM_CARD'])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.endTurn()

					// [TURN 1] //
					// Same for starting as the second player.
					expect(game.state.turn.availableActions).toEqual(['PLAY_HERMIT_CARD'])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					// You can attack as the second player.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
					])
					expect(game.state.turn.completedActions).toEqual(['PLAY_ITEM_CARD'])
					expect(game.state.turn.blockedActions).toEqual({})
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Main Attacks Availability and Blocking', async () => {
		await mockGame(
			{
				playerOneDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					BalancedDoubleItem,
					BalancedDoubleItem,
					BalancedDoubleItem,
				],
				mockGame: async (test, game) => {
					// [TURN 0] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					// You cannot attack on the first turn.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
					])
					expect(game.state.turn.completedActions).toEqual(['PLAY_ITEM_CARD'])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.endTurn()

					// [TURN 1] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					// You can attack as the second player. Both attacks are available with sufficient energy.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
					])
					expect(game.state.turn.completedActions).toEqual(['PLAY_ITEM_CARD'])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.endTurn()

					// [TURN 2] //
					// Now the first player can attack. There is only energy sufficient for primary attack.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(BalancedItem, 'item', 0, 1)
					await test.endTurn()

					// [TURN 3] //
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 1)
					await test.endTurn()

					// [TURN 4] //
					// Now player 1 has enough energy for both attacks.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.attack('primary')
					// You cannot do anything else after attacking. Underusing doesn't do shenanigans.
					expect(game.state.turn.availableActions).toEqual(['END_TURN'])
					expect(game.state.turn.completedActions).toEqual([
						'SINGLE_USE_ATTACK',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
					])
					expect(game.state.turn.blockedActions).toEqual({
						game: [
							'SINGLE_USE_ATTACK',
							'PRIMARY_ATTACK',
							'SECONDARY_ATTACK',
							'PLAY_HERMIT_CARD',
							'PLAY_ITEM_CARD',
							'PLAY_EFFECT_CARD',
							'PLAY_SINGLE_USE_CARD',
							'CHANGE_ACTIVE_HERMIT',
						],
					})
					await test.endTurn()

					// [TURN 5] //
					// Test for secondary attack. Overcharging doesn't do shenanigans.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					await test.attack('secondary')
					expect(game.state.turn.availableActions).toEqual(['END_TURN'])
					expect(game.state.turn.completedActions).toEqual([
						'SINGLE_USE_ATTACK',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
					])
					expect(game.state.turn.blockedActions).toEqual({
						game: [
							'SINGLE_USE_ATTACK',
							'PRIMARY_ATTACK',
							'SECONDARY_ATTACK',
							'PLAY_HERMIT_CARD',
							'PLAY_ITEM_CARD',
							'PLAY_EFFECT_CARD',
							'PLAY_SINGLE_USE_CARD',
							'CHANGE_ACTIVE_HERMIT',
						],
					})
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Hard Switch', async () => {
		await mockGame(
			{
				playerOneDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					BalancedDoubleItem,
					BalancedDoubleItem,
				],
				playerTwoDeck: [VintageBeefCommon],
				mockGame: async (test, game) => {
					// [TURN 0]
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					// [TURN 1] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					// [TURN 2] //
					await test.changeActiveHermit(1)
					// You can't do anything else after switching.
					expect(game.state.turn.availableActions).toEqual(['END_TURN'])
					expect(game.state.turn.completedActions).toEqual([
						'CHANGE_ACTIVE_HERMIT',
					])
					expect(game.state.turn.blockedActions).toEqual({
						game: [
							'SINGLE_USE_ATTACK',
							'PRIMARY_ATTACK',
							'SECONDARY_ATTACK',
							'PLAY_HERMIT_CARD',
							'PLAY_ITEM_CARD',
							'PLAY_EFFECT_CARD',
							'PLAY_SINGLE_USE_CARD',
						],
					})
					await test.endTurn()

					// [TURN 3] //
					await test.endTurn()

					// [TURN 4] //
					// Test switching into hermit with items. (See Double Piston Extender bug.)
					await test.changeActiveHermit(0)
					expect(game.state.turn.availableActions).toEqual(['END_TURN'])
					expect(game.state.turn.completedActions).toEqual([
						'CHANGE_ACTIVE_HERMIT',
					])
					expect(game.state.turn.blockedActions).toEqual({
						game: [
							'SINGLE_USE_ATTACK',
							'PRIMARY_ATTACK',
							'SECONDARY_ATTACK',
							'PLAY_HERMIT_CARD',
							'PLAY_ITEM_CARD',
							'PLAY_EFFECT_CARD',
							'PLAY_SINGLE_USE_CARD',
						],
					})
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Apply Single Use', async () => {
		await mockGame(
			{
				playerOneDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Fortune,
					Totem,
					BalancedDoubleItem,
					BalancedDoubleItem,
				],
				playerTwoDeck: [VintageBeefCommon],
				mockGame: async (test, game) => {
					// [TURN 0] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					// [TURN 1] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					// [TURN 2] //
					await test.playCardFromHand(Fortune, 'single_use')
					// You are forced to confirm.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'REMOVE_EFFECT',
						'APPLY_EFFECT',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.removeEffect()
					// Cancelling reverts everything back.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(Fortune, 'single_use')
					await test.applyEffect()
					// After applying, you can now do everything else but play a second single-use effect.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([
						'PLAY_SINGLE_USE_CARD',
					])
					expect(game.state.turn.blockedActions).toEqual({})
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Single Use Attack', async () => {
		await mockGame(
			{
				playerOneDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					IronSword,
					Fortune,
					Totem,
					BalancedDoubleItem,
					BalancedDoubleItem,
				],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					IronSword,
					Fortune,
					Totem,
					BalancedDoubleItem,
				],
				mockGame: async (test, game) => {
					// [TURN 0] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.playCardFromHand(IronSword, 'single_use')
					// It's the first turn so you cannot attack.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'REMOVE_EFFECT',
						'CHANGE_ACTIVE_HERMIT',
						'PLAY_HERMIT_CARD',
						'PLAY_EFFECT_CARD',
					])
					expect(game.state.turn.completedActions).toEqual(['PLAY_ITEM_CARD'])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.endTurn()

					// [TURN 1] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(IronSword, 'single_use')
					// You can attack with Iron Sword, but not main attacks due to no items attached.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'REMOVE_EFFECT',
						'CHANGE_ACTIVE_HERMIT',
						'SINGLE_USE_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.attack('single-use')
					// Single-use attack counts as an attack, so you can't do anything else afterwards.
					expect(game.state.turn.availableActions).toEqual(['END_TURN'])
					expect(game.state.turn.completedActions).toEqual([
						'SINGLE_USE_ATTACK',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_SINGLE_USE_CARD',
					])
					expect(game.state.turn.blockedActions).toEqual({
						game: [
							'SINGLE_USE_ATTACK',
							'PRIMARY_ATTACK',
							'SECONDARY_ATTACK',
							'PLAY_HERMIT_CARD',
							'PLAY_ITEM_CARD',
							'PLAY_EFFECT_CARD',
							'PLAY_SINGLE_USE_CARD',
							'CHANGE_ACTIVE_HERMIT',
						],
					})
					await test.endTurn()

					// [TURN 2] //
					await test.playCardFromHand(IronSword, 'single_use')
					// You can attack with either primary, secondary, or just with the sword.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'REMOVE_EFFECT',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'SINGLE_USE_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.attack('single-use')
					// Single-use attack takes up the entire attack phase.
					expect(game.state.turn.availableActions).toEqual(['END_TURN'])
					expect(game.state.turn.completedActions).toEqual([
						'SINGLE_USE_ATTACK',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_SINGLE_USE_CARD',
					])
					expect(game.state.turn.blockedActions).toEqual({
						game: [
							'SINGLE_USE_ATTACK',
							'PRIMARY_ATTACK',
							'SECONDARY_ATTACK',
							'PLAY_HERMIT_CARD',
							'PLAY_ITEM_CARD',
							'PLAY_EFFECT_CARD',
							'PLAY_SINGLE_USE_CARD',
							'CHANGE_ACTIVE_HERMIT',
						],
					})
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Attaching', async () => {
		await mockGame(
			{
				playerOneDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					Totem,
					BalancedDoubleItem,
					BalancedDoubleItem,
				],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					Totem,
					Totem,
					BalancedDoubleItem,
					BalancedDoubleItem,
				],
				mockGame: async (test, game) => {
					// [TURN 0] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					// [TURN 1] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.endTurn()

					// [TURN 1] //
					await test.playCardFromHand(Totem, 'attach', 0)
					// Attaching doesn't disallow anything. (Unlike the official rules.)
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.endTurn()

					// [TURN 2] //
					await test.playCardFromHand(Totem, 'attach', 0)
					// You can't attach after filling all available slots.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					// A new attach slot has appeared with the recently played hermit.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_EFFECT_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
					await test.playCardFromHand(Totem, 'attach', 1)
					// All slots are filled up again.
					expect(game.state.turn.availableActions).toEqual([
						'END_TURN',
						'CHANGE_ACTIVE_HERMIT',
						'PRIMARY_ATTACK',
						'SECONDARY_ATTACK',
						'PLAY_HERMIT_CARD',
						'PLAY_SINGLE_USE_CARD',
						'PLAY_ITEM_CARD',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
				},
			},
			{startWithAllCards: true},
		)
	})
	test('Test Knockout', async () => {
		await mockGame(
			{
				playerOneDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					IronSword,
					Fortune,
					Totem,
					BalancedDoubleItem,
				],
				playerTwoDeck: [VintageBeefCommon, BalancedDoubleItem],
				mockGame: async (test, game) => {
					// [TURN 0] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.endTurn()

					// [TURN 1] //
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 0)
					await test.attack('secondary')
					await test.endTurn()

					// [TURN 2] //
					await test.endTurn()

					// [TURN 3] //
					await test.attack('secondary')
					await test.endTurn()

					// [TURN 4] //
					await test.endTurn()

					// [TURN 5] //
					await test.attack('secondary')
					await test.endTurn()

					// [TURN 6] //
					await test.endTurn()

					// [TURN 7] //
					await test.attack('secondary') // Knocks out the opposing hermit.
					await test.endTurn()

					// [TURN 8] //
					// You need to have an active hermit.
					expect(game.state.turn.availableActions).toEqual([
						'CHANGE_ACTIVE_HERMIT',
					])
					expect(game.state.turn.completedActions).toEqual([])
					expect(game.state.turn.blockedActions).toEqual({})
				},
			},
			{startWithAllCards: true},
		)
	})
})
