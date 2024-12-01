import {describe, expect, test} from '@jest/globals'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import FletchingTable from 'common/cards/advent-of-tcg/single-use/fletching-table'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import query from 'common/components/query'
import {testGame} from '../../utils'

describe('Test Fletching Table', () => {
	test('Each Fletching Table in the starting deck adds a Feather', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FletchingTable],
				playerTwoDeck: [EthosLabCommon, ...Array(3).fill(FletchingTable)],
				saga: function* (game) {
					expect(
						game.currentPlayer
							.getHand()
							.filter((card) => query.card.is(Feather)(game, card)).length,
					).toBe(1)
					expect(
						game.opponentPlayer
							.getHand()
							.filter((card) => query.card.is(Feather)(game, card)).length,
					).toBe(3)
				},
			},
			{startWithAllCards: true},
		)
	})
})
