import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HypnotizdRare from 'common/cards/hermits/hypnotizd-rare'
import MinerDoubleItem from 'common/cards/items/miner-rare'
import Bow from 'common/cards/single-use/bow'
import Crossbow from 'common/cards/single-use/crossbow'
import Efficiency from 'common/cards/single-use/efficiency'
import {
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import EfficiencyEffect from 'common/status-effects/efficiency'
import {testGame} from '../utils'

describe('Test Rare Hypnotizd', () => {
	test('Secondary attack and bow can select different targets', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, Bow, MinerDoubleItem],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(HypnotizdRare, 'hermit', 0)
					await test.playCardFromHand(MinerDoubleItem, 'item', 0, 0)
					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(2)

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					await test.pick(
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
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.item,
							query.slot.rowIndex(0),
							query.slot.index(0),
						)?.card,
					).toBe(null)
				},
			},
			{startWithAllCards: true},
		)
	})

	test('Secondary attack can not select AFK target without item card', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, Efficiency],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(HypnotizdRare, 'hermit', 0)
					await test.playCardFromHand(Efficiency, 'single_use')
					await test.applyEffect()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(EfficiencyEffect),
							query.effect.targetIsPlayerAnd(query.player.currentPlayer),
						),
					).not.toBe(null)

					await test.attack('secondary')

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - HypnotizdRare.secondary.damage)
				},
			},
			{startWithAllCards: true},
		)
	})

	test('Secondary attack can be canceled to change target', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, MinerDoubleItem, Crossbow],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(HypnotizdRare, 'hermit', 0)
					await test.playCardFromHand(MinerDoubleItem, 'item', 0, 0)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(2)

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					await test.pick(
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)
					await test.removeEffect()
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - HypnotizdRare.secondary.damage)

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
					).toBe(EthosLabCommon.health)

					expect(
						game.components.find(
							SlotComponent,
							query.slot.currentPlayer,
							query.slot.item,
							query.slot.rowIndex(0),
							query.slot.index(0),
						)?.card,
					).not.toBe(null)
				},
			},
			{startWithAllCards: true},
		)
	})
})
