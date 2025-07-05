import {describe, expect, test} from '@jest/globals'
import SolidaritygamingRare from 'common/cards/advent-of-tcg/hermits/solidaritygaming-rare'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import IJevinRare from 'common/cards/hermits/ijevin-rare'
import SkizzlemanRare from 'common/cards/hermits/skizzleman-rare'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import Egg from 'common/cards/single-use/egg'
import Knockback from 'common/cards/single-use/knockback'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import ProtectedEffect from 'common/status-effects/protected'
import {testGame} from '../../utils'

describe('Test Jimmy "The Law"', () => {
	test('The Law functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.afk,
							),
						),
					).not.toBe(null)
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(SolidaritygamingRare.health - EthosLabCommon.secondary.damage)
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(SolidaritygamingRare.health - EthosLabCommon.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Sheriff's Protection can only protect one hermit per side", async () => {
		await testGame(
			{
				playerOneDeck: [SolidaritygamingRare, EthosLabCommon],
				playerTwoDeck: [
					SolidaritygamingRare,
					SolidaritygamingRare,
					ArmorStand,
					ChorusFruit,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 0)
					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 1)
					await test.playCardFromHand(ArmorStand, 'hermit', 2)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(2)),
							),
						),
					).not.toBe(null)
					await test.endTurn()

					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(1)),
							),
						),
					).not.toBe(null)
					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(2)),
							),
						),
					).not.toBe(null)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(2)),
							),
						),
					).toBe(null)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(1)),
							),
						),
					).not.toBe(null)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.endTurn()

					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.changeActiveHermit(1)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(1)),
							),
						),
					).not.toBe(null)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(1)),
							),
						),
					).toBe(null)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(
								query.card.currentPlayer,
								query.card.row(query.row.index(0)),
							),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Sheriff's Protection protects against Fire + Egg + Gas Light", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, SolidaritygamingRare],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.endTurn()

					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.endTurn()

					expect(game.currentPlayer.activeRow?.index).toBe(0)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 40 /* 2x Burn damage*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Sheriff's Protection does not expire when row is activated by Knockback", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Knockback],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)
					await test.changeActiveHermit(0)
					await test.endTurn()

					await test.endTurn()
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Sheriff's Protection still expires when row is deactivated by Knockback", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Knockback],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon, ChorusFruit],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('primary')
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
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)
					await test.endTurn()

					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Sheriff's Protection works after previous active was KO'd by Extra Flee", async () => {
		await testGame(
			{
				playerOneDeck: [SolidaritygamingRare, EthosLabCommon],
				playerTwoDeck: [TangoTekRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(TangoTekRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Sheriff's Protection expires correctly after defending against Peace Out + Egg", async () => {
		await testGame(
			{
				playerOneDeck: [IJevinRare, Egg, Egg],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(IJevinRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(SolidaritygamingRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)
					await test.endTurn()

					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
