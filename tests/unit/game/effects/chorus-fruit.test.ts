import {describe, expect, test} from '@jest/globals'
import HumanCleoRare from 'common/cards/alter-egos/hermits/humancleo-rare'
import BdoubleO100Rare from 'common/cards/default/hermits/bdoubleo100-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import ChorusFruit from 'common/cards/default/single-use/chorus-fruit'
import CurseOfBinding from 'common/cards/default/single-use/curse-of-binding'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Chorus Fruit', () => {
	test('Basic functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.currentPlayer.activeRow?.index).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Chorus Fruit can be used to swap after attacking for Betrayed', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [HumanCleoRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 0)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')

					// First request should be for Betrayal target
					expect(game.state.pickRequests).toHaveLength(1)
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					// Second request should be to switch active row
					expect(game.state.pickRequests).toHaveLength(1)
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.currentPlayer.activeRow?.index).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Curse of Binding prevents using Chorus Fruit', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [EthosLabCommon, CurseOfBinding],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, CurseOfBinding, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)

					expect(
						game.getPickableSlots(ChorusFruit.attachCondition),
					).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Shreep prevents using Chorus Fruit', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					BdoubleO100Rare,
					EthosLabCommon,
					ChorusFruit,
					ChorusFruit,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BdoubleO100Rare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')
					expect(game.currentPlayer.singleUseCardUsed).toBe(true)
					expect(game.state.pickRequests).toHaveLength(0)
					yield* endTurn(game)

					yield* endTurn(game)

					expect(
						game.getPickableSlots(ChorusFruit.attachCondition),
					).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
