import {describe, expect, test} from '@jest/globals'
import ImmortalityBed from 'common/cards/bed-update/attach/immortality-bed'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import {CardComponent} from 'common/components'
import {testGame} from '../utils'

describe('Test Immortality Bed', () => {
	test('Immortality Bed returns attached hermit to hand on knock-out without losing a life or giving a prize card', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ImmortalityBed,
					...Array(7).fill(BalancedItem),
				],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ImmortalityBed, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')
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
					await test.endTurn()

					expect(game.state.turn.availableActions).toStrictEqual([
						'CHANGE_ACTIVE_HERMIT',
					])
					await test.changeActiveHermit(1)
				},
			},
			{noItemRequirements: true, oneShotMode: true, startWithAllCards: false},
		)
	})
})
