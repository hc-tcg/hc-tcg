import {describe, expect, test} from '@jest/globals'
import CyberpunkImpulseRare from 'common/cards/advent-of-tcg/hermits/cyberpunkimpulse-rare'
import SmallishbeansAdventRare from 'common/cards/advent-of-tcg/hermits/smallishbeans-rare'
import String from 'common/cards/attach/string'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import HypnotizdRare from 'common/cards/hermits/hypnotizd-rare'
import FarmItem from 'common/cards/items/farm-common'
import RedstoneItem from 'common/cards/items/redstone-common'
import WildItem from 'common/cards/items/wild-common'
import Efficiency from 'common/cards/single-use/efficiency'
import {getAvailableEnergy} from 'server/routines/game'
import {
	applyEffect,
	attack,
	endTurn,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Cyberpunk Impulse', () => {
	test('Energy transferred', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					CyberpunkImpulseRare,
					WildItem,
					RedstoneItem,
				],
				playerTwoDeck: [EthosLabCommon, CyberpunkImpulseRare, FarmItem, String],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, WildItem, 'item', 1, 0)
					expect(getAvailableEnergy(game)).toStrictEqual([])
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, FarmItem, 'item', 1, 0)
					yield* playCardFromHand(
						game,
						String,
						'item',
						1,
						2,
						game.opponentPlayerEntity,
					)

					expect(getAvailableEnergy(game)).toStrictEqual(['any'])
					yield* endTurn(game)

					yield* playCardFromHand(game, RedstoneItem, 'item', 1, 1)
					expect(getAvailableEnergy(game)).toStrictEqual([])
					expect(game.currentPlayer.activeRow?.getItems()).toStrictEqual([])
				},
			},
			{},
		)
	})

	test('Betrayed uses the correct amount of transferred energy available', () => {
		testGame(
			{
				playerOneDeck: [
					CyberpunkImpulseRare,
					CyberpunkImpulseRare,
					FarmItem,
					FarmItem,
				],
				playerTwoDeck: [HumanCleoRare, Efficiency],
				saga: function* (game) {
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 0)
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, FarmItem, 'item', 1, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, Efficiency, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.currentPlayer.getActiveHermit()?.getAttackCost('secondary'),
					).toHaveLength(2)
					expect(getAvailableEnergy(game)).toStrictEqual(['any'])
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					yield* playCardFromHand(game, FarmItem, 'item', 1, 1)
					expect(game.state.turn.availableActions).toContain('SECONDARY_ATTACK')
					expect(game.state.turn.availableActions).not.toContain('END_TURN')
				},
			},
			{forceCoinFlip: true, noItemRequirements: false},
		)
	})

	test('Hypno can discard a Farm item from Cyberpunk Impulse', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, CyberpunkImpulseRare, FarmItem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, HypnotizdRare, 'hermit', 0)
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, FarmItem, 'item', 1, 0)
					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toHaveLength(1)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Stratos Joel counts items attached to Cyberpunk Impulse', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					SmallishbeansAdventRare,
					CyberpunkImpulseRare,
					FarmItem,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SmallishbeansAdventRare, 'hermit', 0)
					yield* playCardFromHand(game, CyberpunkImpulseRare, 'hermit', 1)
					yield* playCardFromHand(game, FarmItem, 'item', 1, 0)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							(SmallishbeansAdventRare.secondary.damage +
								20) /** 1 "attached" item */,
					)
				},
			},
			{noItemRequirements: true},
		)
	})
})
