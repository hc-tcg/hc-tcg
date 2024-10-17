import {describe, expect, test} from '@jest/globals'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import BoomerBdubsRare from 'common/cards/alter-egos-ii/hermits/boomerbdubs-rare'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'
import GeminiTayRare from 'common/cards/default/hermits/geminitay-rare'
import ZombieCleoRare from 'common/cards/default/hermits/zombiecleo-rare'
import Fortune from 'common/cards/default/single-use/fortune'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test The Grianch Naughty', () => {
	test('Fortune only applies to first flip for Naughty per turn', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, BadOmen],
				playerTwoDeck: [
					ZombieCleoRare,
					BadOmen,
					GrianchRare,
					GeminiTayRare,
					Fortune,
					Fortune,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianchRare, 'hermit', 1)
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 2)
					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Using Boomer Bdubs "Watch This" twice', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, BadOmen],
				playerTwoDeck: [BoomerBdubsRare, BadOmen, Fortune],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BoomerBdubsRare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, Fortune, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'secondary')
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* attack(game, 'secondary')
					yield* finishModalRequest(game, {result: true, cards: null})
					yield* finishModalRequest(game, {result: false, cards: null})
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health - (BoomerBdubsRare.secondary.damage + 20),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
