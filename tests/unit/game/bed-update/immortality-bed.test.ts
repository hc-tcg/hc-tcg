import {describe, expect, test} from '@jest/globals'
import ImmortalityBed from 'common/cards/bed-update/attach/immortality-bed'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import {CardComponent} from 'common/components'
import {
	attack,
	changeActiveHermit,
	endTurn,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Immortality Bed', () => {
	test('Immortality Bed returns attached hermit to hand on knock-out without losing a life or giving a prize card', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ImmortalityBed,
					...Array(7).fill(BalancedItem),
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ImmortalityBed, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
					expect(
						game.opponentPlayer
							.getHand()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([...Array(5).fill(BalancedItem), EthosLabCommon])
					expect(
						game.opponentPlayer.getDiscarded().map((card) => card.props),
					).toStrictEqual([ImmortalityBed])
					expect(game.opponentPlayer.activeRow).toBe(null)
					expect(game.opponentPlayer.lives).toBe(3)
					expect(
						game.currentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([])
					yield* endTurn(game)

					expect(game.state.turn.availableActions).toStrictEqual([
						'CHANGE_ACTIVE_HERMIT',
					])
					yield* changeActiveHermit(game, 1)
				},
			},
			{noItemRequirements: true, oneShotMode: true, startWithAllCards: false},
		)
	})
})
