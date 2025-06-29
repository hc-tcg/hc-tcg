import {describe, expect, test} from '@jest/globals'
import BigBSt4tzRare from 'common/cards/advent-of-tcg/hermits/bigbst4tz2-rare'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import {Thorns} from 'common/cards/attach/thorns'
import Totem from 'common/cards/attach/totem'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoodTimesWithScarRare from 'common/cards/hermits/goodtimeswithscar-rare'
import PrincessGemRare from 'common/cards/hermits/princessgem-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import BadOmen from 'common/cards/single-use/bad-omen'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import {IronSword} from 'common/cards/single-use/sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {soulmateEffectDamage} from 'common/status-effects/soulmate'
import {testGame} from '../../utils'

describe('Test BigB Soulmate', () => {
	test('Soulmate functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BigBSt4tzRare.secondary.damage)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10

					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							BigBSt4tzRare.secondary.damage -
							soulmateEffectDamage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Soulmate does not deal extra damage when revived by Totem', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BigBSt4tzRare, Totem],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(Totem, 'attach', 0)
					await test.attack('secondary')
					await test.endTurn()

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10

					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BigBSt4tzRare.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Disabled Totem does not prevent extra Soulmate damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, GoldenAxe],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, Totem],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Totem, 'attach', 0)
					await test.attack('secondary')
					await test.endTurn()

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10

					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							BigBSt4tzRare.secondary.damage -
							soulmateEffectDamage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Soulmate + Thorns does not knock-out hermit as it is revived', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Totem],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, Thorns],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Totem, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Thorns, 'attach', 0)
					await test.attack('secondary')
					await test.endTurn()

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10
					// Manually set Etho health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(0),
					)!.health = 10

					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Soulmate extra damage is not blocked by "Royal Protection"', async () => {
		await testGame(
			{
				playerOneDeck: [BigBSt4tzRare, EthosLabCommon],
				playerTwoDeck: [
					PrincessGemRare,
					EthosLabCommon,
					LavaBucket,
					ChorusFruit,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(PrincessGemRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10
					await test.endTurn()

					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - soulmateEffectDamage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Soulmate causing double knock-out when triggered by Burn', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LavaBucket],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('secondary')
					await test.endTurn()

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10
					// Manually set Etho health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(0),
					)!.health = 10
					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					// TODO: Decide if this is desired behavior
					expect(game.currentPlayer.activeRow).toBe(null)
					expect(game.opponentPlayer.activeRow).toBe(null)

					await test.changeActiveHermit(1)
					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					await test.endTurn()

					await test.changeActiveHermit(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	// Test interactions with Grianch which allows two attacks in one turn
	test('Soulmate does not deal extra damage when revived by Deathloop', async () => {
		await testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					BigBSt4tzRare,
					GoodTimesWithScarRare,
					BadOmen,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(BigBSt4tzRare, 'hermit', 1)
					await test.playCardFromHand(GoodTimesWithScarRare, 'hermit', 2)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						GrianchRare.health -
							BigBSt4tzRare.secondary.damage -
							GoodTimesWithScarRare.secondary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
