import {describe, expect, test} from '@jest/globals'
import Shield from 'common/cards/default/effects/shield'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test Shield', () => {
	test('Base Functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Shield],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Shield, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(EthosLabCommon.secondary.damage - 60) /*shield*/,
					)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.opponent,
								query.slot.attach,
								query.slot.rowIndex(0),
							)
							?.getCard(),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
