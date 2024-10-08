import {describe, expect, test} from '@jest/globals'
import LightningRod from 'common/cards/attach/lightning-rod'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Bow from 'common/cards/default/single-use/bow'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Lightning Rod', () => {
	test('Test redirecting multiple attacks at once', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					LightningRod,
				],
				playerTwoDeck: [EthosLabCommon, Bow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, LightningRod, 'attach', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.primary.damage -
							40 /*bow damage*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
