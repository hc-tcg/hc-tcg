import {describe, expect, test} from '@jest/globals'
import BerryBush from 'common/cards/advent-of-tcg/effects/berry-bush'
import LDShadowLadyRare from 'common/cards/advent-of-tcg/hermits/ldshadowlady-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Crossbow from 'common/cards/default/single-use/crossbow'
import Slimeball from 'common/cards/advent-of-tcg/effects/slimeball'
import query from 'common/components/query'
import {
	attack,
	endTurn,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../../utils'

describe('Test Lizzie Evict', () => {
	test('Evict moves opponent active row', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [LDShadowLadyRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, LDShadowLadyRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - LDShadowLadyRare.secondary.damage,
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(2)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Slimeball triggers Evict damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [LDShadowLadyRare, Slimeball],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, LDShadowLadyRare, 'hermit', 0)
					yield* playCardFromHand(
						game,
						Slimeball,
						'attach',
						0,
						game.opponentPlayerEntity,
					)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - LDShadowLadyRare.secondary.damage - 40,
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Canceling Evict then dealing bonus damage for full board', () => {
		testGame(
			{
				playerOneDeck: Array(4).fill(EthosLabCommon),
				playerTwoDeck: [LDShadowLadyRare, Crossbow, BerryBush],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* endTurn(game)

					yield* playCardFromHand(game, LDShadowLadyRare, 'hermit', 0)
					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(4),
					)
					yield* removeEffect(game)
					yield* playCardFromHand(
						game,
						BerryBush,
						'hermit',
						4,
						game.opponentPlayerEntity,
					)
					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toHaveLength(0)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - LDShadowLadyRare.secondary.damage - 40,
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
