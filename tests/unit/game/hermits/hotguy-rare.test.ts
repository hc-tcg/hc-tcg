import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import JinglerRare from 'common/cards/hermits/jingler-rare'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'
import HotguyRare from 'common/cards/hermits/hotguy-rare'
import Crossbow from 'common/cards/single-use/crossbow'
import {ThornsIII} from 'common/cards/attach/thorns'
import {RowComponent} from 'common/components'

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
