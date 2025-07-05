import {describe, expect, test} from '@jest/globals'
import BerryBush from 'common/cards/advent-of-tcg/attach/berry-bush'
import Slimeball from 'common/cards/advent-of-tcg/attach/slimeball'
import LDShadowLadyRare from 'common/cards/advent-of-tcg/hermits/ldshadowlady-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Crossbow from 'common/cards/single-use/crossbow'
import query from 'common/components/query'
import {testGame} from '../../utils'

describe('Test Lizzie Evict', () => {
	test('Evict moves opponent active row', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [LDShadowLadyRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(LDShadowLadyRare, 'hermit', 0)
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - LDShadowLadyRare.secondary.damage,
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(2)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Slimeball triggers Evict damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [LDShadowLadyRare, Slimeball],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(LDShadowLadyRare, 'hermit', 0)
					await test.playCardFromHand(
						Slimeball,
						'attach',
						0,
						game.opponentPlayerEntity,
					)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - LDShadowLadyRare.secondary.damage - 40,
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Canceling Evict then dealing bonus damage for full board', async () => {
		await testGame(
			{
				playerOneDeck: Array(4).fill(EthosLabCommon),
				playerTwoDeck: [LDShadowLadyRare, Crossbow, BerryBush],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.endTurn()

					await test.playCardFromHand(LDShadowLadyRare, 'hermit', 0)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(4),
					)
					await test.removeEffect()
					await test.playCardFromHand(
						BerryBush,
						'hermit',
						4,
						game.opponentPlayerEntity,
					)
					await test.attack('secondary')
					expect(game.state.pickRequests).toHaveLength(0)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - LDShadowLadyRare.secondary.damage - 40,
					)
					expect(game.opponentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
