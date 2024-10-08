import {describe, expect, test} from '@jest/globals'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Poe Poe Skizz Rare', () => {
	test('Jumpscare.', () => {
		testGame(
			{
				playerOneDeck: [PoePoeSkizzRare],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, PoePoeSkizzRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - PoePoeSkizzRare.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /* Jumpscare */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
