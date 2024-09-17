import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import HypnotizdRare from 'common/cards/default/hermits/hypnotizd-rare'
import MinerDoubleItem from 'common/cards/default/items/miner-rare'
import Bow from 'common/cards/default/single-use/bow'
import {RowComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Rare Hypnotizd', () => {
	test('Secondary attack and bow can select different targets', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, Bow, MinerDoubleItem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, HypnotizdRare, 'hermit', 0)
					yield* playCardFromHand(game, MinerDoubleItem, 'item', 0, 0)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(2)

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

					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
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
					).toBe(EthosLabCommon.health - HypnotizdRare.secondary.damage)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /*Bow damage*/)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.item,
								query.slot.rowIndex(0),
								query.slot.index(0),
							)
							?.getCard(),
					).toBe(null)
				},
			},
			{startWithAllCards: true},
		)
	})
})
