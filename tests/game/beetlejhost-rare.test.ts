import {describe, expect, test} from '@jest/globals'
import BeetlejhostRare from 'common/cards/alter-egos-iii/hermits/beetlejhost-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

describe('Test Beetlejhost Rare', () => {
	test('Test Jopacity having damage reduced', () => {
		testGame(
			{
				playerOneDeck: [BeetlejhostRare],
				playerTwoDeck: [BeetlejhostRare],
				saga: function* (game) {
					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						BeetlejhostRare.health - (2 * BeetlejhostRare.secondary.damage) + 10
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, disableDeckOut: true},
		)
	})
})