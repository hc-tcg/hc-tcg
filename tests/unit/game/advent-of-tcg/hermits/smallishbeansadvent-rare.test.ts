import {describe, expect, test} from '@jest/globals'
import ElderGuardian from 'common/cards/advent-of-tcg/attach/elder-guardian'
import SmallishbeansAdventRare from 'common/cards/advent-of-tcg/hermits/smallishbeans-rare'
import String from 'common/cards/attach/string'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import SmallishbeansRare from 'common/cards/hermits/smallishbeans-rare'
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
					// We have less than 3 items so we only deal 90 damage
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - SmallishbeansAdventRare.secondary.damage,
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
							20 /** 1 attached Wild Item + 1 String in item slot + 1 double PvP item = 4 items */,
					)
				},
			},
			{startWithAllCards: true},
		)
	})

	test('Stratos Joel does not count for rare Joel "Obsess"', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [SmallishbeansRare, SmallishbeansAdventRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SmallishbeansRare, 'hermit', 0)
					yield* playCardFromHand(game, SmallishbeansAdventRare, 'hermit', 1)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - SmallishbeansRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Elder Guardian reduces damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ElderGuardian],
				playerTwoDeck: [
					SmallishbeansAdventRare,
					PvPDoubleItem,
					PvPDoubleItem,
					PvPDoubleItem,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SmallishbeansAdventRare, 'hermit', 1)
					yield* attack(game, 'primary')

					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - SmallishbeansAdventRare.primary.damage,
					)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, PvPDoubleItem, 'item', 1, 0)
					yield* playCardFromHand(game, PvPDoubleItem, 'item', 1, 1)
					yield* playCardFromHand(game, PvPDoubleItem, 'item', 1, 2)

					yield* attack(game, 'secondary')

					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							SmallishbeansAdventRare.primary.damage -
							SmallishbeansAdventRare.secondary.damage -
							20 * 2 /* 2 extra items over cost */,
					)
				},
			},
			{
				startWithAllCards: true,
				noItemRequirements: true,
				availableActions: ['PLAY_ITEM_CARD'],
			},
		)
	})
})
