import {describe, expect, test} from '@jest/globals'
import {ThornsIII} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HotguyRare from 'common/cards/hermits/hotguy-rare'
import RendogRare from 'common/cards/hermits/rendog-rare'
import Bow from 'common/cards/single-use/bow'
import Crossbow from 'common/cards/single-use/crossbow'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Hotguy Rare', () => {
	test('Test Hotguy with Bow', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HotguyRare, Bow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, HotguyRare, 'hermit', 0)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'secondary')

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
					).toBe(EthosLabCommon.health - HotguyRare.secondary.damage)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 80 /* Bow */)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Hotguy with Crossbow', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					/* Thorns is being tested because it was a suspected bugged interacton
					 * https://discord.com/channels/1073763159187390584/1341987170180796487/1341988384783994891 */
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
	test('Test Hotguy with type advantage', () => {
		testGame(
			{
				playerOneDeck: [RendogRare, RendogRare, RendogRare],
				playerTwoDeck: [HotguyRare, Crossbow],
				saga: function* (game) {
					/** This tests the bug found in https://discord.com/channels/1073763159187390584/1341987170180796487/1352075972245192805 */
					yield* playCardFromHand(game, RendogRare, 'hermit', 0)
					yield* playCardFromHand(game, RendogRare, 'hermit', 1)
					yield* playCardFromHand(game, RendogRare, 'hermit', 2)
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
						RendogRare.health -
							HotguyRare.secondary.damage -
							40 /* Crossbow */ -
							20 /* Type advantage */,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(RendogRare.health - 40 /* Crossbow */)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(RendogRare.health - 40 /* Crossbow */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
