import {describe, expect, test} from '@jest/globals'
import SmallishbeansAdventRare from 'common/cards/advent-of-tcg/hermits/smallishbeans-rare'
import String from 'common/cards/attach/string'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import PvPDoubleItem from 'common/cards/items/pvp-rare'
import WildItem from 'common/cards/items/wild-common'
import Efficiency from 'common/cards/single-use/efficiency'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Stratos Joel', () => {
	test('Lore functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, String],
				playerTwoDeck: [
					SmallishbeansAdventRare,
					WildItem,
					Efficiency,
					PvPDoubleItem,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SmallishbeansAdventRare, 'hermit', 0)
					yield* playCardFromHand(game, WildItem, 'item', 0, 0)
					yield* playCardFromHand(game, Efficiency, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							SmallishbeansAdventRare.secondary.damage -
							20 /** 1 attached Wild Item */,
					)
					yield* endTurn(game)

					yield* playCardFromHand(
						game,
						String,
						'item',
						0,
						1,
						game.opponentPlayerEntity,
					)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, PvPDoubleItem, 'item', 0, 2)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							SmallishbeansAdventRare.secondary.damage -
							80 /** 1 attached Wild Item + 1 String in item slot + 1 double PvP item*/,
					)
				},
			},
			{startWithAllCards: true},
		)
	})
})
