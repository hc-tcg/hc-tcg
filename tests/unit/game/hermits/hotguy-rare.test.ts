import {describe, expect, test} from '@jest/globals'
import {ThornsIII} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HotguyRare from 'common/cards/hermits/hotguy-rare'
import Crossbow from 'common/cards/single-use/crossbow'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Hotguy Rare', () => {
	test('Test Hotguy with Crossbow', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					ThornsIII,
				],
				playerTwoDeck: [HotguyRare, Crossbow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, ThornsIII, 'attach', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, HotguyRare, 'hermit', 0)
					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							HotguyRare.secondary.damage -
							40 /* Crossbow */,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /* Crossbow */)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /* Crossbow */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
