import {describe, expect, test} from '@jest/globals'
import Cat from 'common/cards/advent-of-tcg/attach/cat'
import ZookeeperScarRare from 'common/cards/advent-of-tcg/hermits/zookeeperscar-rare'
import Wolf from 'common/cards/attach/wolf'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Emerald from 'common/cards/single-use/emerald'
import {
	applyEffect,
	attack,
	endTurn,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Zookeeper Scar', () => {
	test('Effect not duplicated when attached to Zookeeper Scar', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ZookeeperScarRare,
					Cat,
					...Array(40).fill(EthosLabCommon),
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* attack(game, 'secondary')
					expect(game.state.modalRequests.length).toStrictEqual(1)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Effect doubles and detaches', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ZookeeperScarRare, Wolf],
				playerTwoDeck: [EthosLabCommon, Emerald],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // Wolf attached to Etho & Wolf attached to
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, Emerald, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // No further damage
				},
			},
			{noItemRequirements: true},
		)
	})
})
