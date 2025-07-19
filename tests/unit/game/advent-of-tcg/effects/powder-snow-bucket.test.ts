import {describe, expect, test} from '@jest/globals'
import BerryBush from 'common/cards/advent-of-tcg/attach/berry-bush'
import PowderSnowBucket from 'common/cards/advent-of-tcg/single-use/powder-snow-bucket'
import Cubfan135Rare from 'common/cards/hermits/cubfan135-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import IJevinRare from 'common/cards/hermits/ijevin-rare'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import Bow from 'common/cards/single-use/bow'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import Egg from 'common/cards/single-use/egg'
import Knockback from 'common/cards/single-use/knockback'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../../utils'

describe('Test Powder Snow Bucket', () => {
	test('Frozen effect prevents attack damage and activating row', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PowderSnowBucket],
				playerTwoDeck: [EthosLabCommon, Bow],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(PowderSnowBucket, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('single-use')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(game.state.turn.availableActions).not.toContain(
						'CHANGE_ACTIVE_HERMIT',
					)
				},
			},
			{startWithAllCards: true},
		)
	})

	test("Knockback and Egg can not be used when opponent's AFK Hermits are Frozen", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PowderSnowBucket],
				playerTwoDeck: [EthosLabCommon, Knockback, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(PowderSnowBucket, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					expect(
						game.getPickableSlots(Knockback.attachCondition),
					).toStrictEqual([])
					expect(game.getPickableSlots(Egg.attachCondition)).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Powder Snow disables switching for Peace Out, Chorus Fruit and Let's Go", async () => {
		await testGame(
			{
				playerOneDeck: [Cubfan135Rare, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [IJevinRare, PowderSnowBucket],
				testGame: async (test, game) => {
					await test.playCardFromHand(Cubfan135Rare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(IJevinRare, 'hermit', 0)
					await test.playCardFromHand(PowderSnowBucket, 'single_use')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					await test.endTurn()

					expect(
						game.getPickableSlots(ChorusFruit.attachCondition),
					).toStrictEqual([])
					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Frozen hermits still take status effect damage', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					PowderSnowBucket,
				],
				playerTwoDeck: [
					EthosLabCommon,
					LavaBucket,
					SplashPotionOfPoison,
					PowderSnowBucket,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(SplashPotionOfPoison, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(PowderSnowBucket, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.playCardFromHand(PowderSnowBucket, 'single_use')
					await test.pick(
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
					).toBe(EthosLabCommon.health - 20 /** Burn */ * 2)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /** Poison */)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /** Burn */ * 3)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /** Poison */ * 2)
				},
			},
			{startWithAllCards: true},
		)
	})

	test('Frozen Berry Bush cannot be damaged, but still removes its health each turn', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [EthosLabCommon, BerryBush, PowderSnowBucket, Bow],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(
					BerryBush,
					'hermit',
					1,
					game.opponentPlayerEntity,
				)
				await test.playCardFromHand(PowderSnowBucket, 'single_use')
				await test.pick(
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				await test.endTurn()

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(1),
					)?.health,
				).toBe(BerryBush.health - 10)
				await test.endTurn()

				await test.playCardFromHand(Bow, 'single_use')
				await test.attack('single-use')
				await test.pick(
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				expect(game.currentPlayer.getHand()).toStrictEqual([])
				await test.endTurn()

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(1),
					)?.health,
				).toBe(BerryBush.health - 10 * 2)
			},
		})
	})

	test('Extra Flee does not switch Hermits while AFK Hermits are Frozen', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PowderSnowBucket],
				playerTwoDeck: [TangoTekRare, EthosLabCommon, PowderSnowBucket],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(PowderSnowBucket, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(TangoTekRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(PowderSnowBucket, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					expect(game.opponentPlayer.lives).toBe(2)
					expect(game.opponentPlayer.activeRow).toBe(null)

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					await test.endTurn()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
