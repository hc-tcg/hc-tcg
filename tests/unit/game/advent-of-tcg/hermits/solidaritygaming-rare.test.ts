import {describe, expect, test} from '@jest/globals'
import SolidaritygamingRare from 'common/cards/advent-of-tcg/hermits/solidaritygaming-rare'
import ArmorStand from 'common/cards/alter-egos/effects/armor-stand'
import Egg from 'common/cards/alter-egos/single-use/egg'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import IJevinRare from 'common/cards/default/hermits/ijevin-rare'
import TangoTekRare from 'common/cards/default/hermits/tangotek-rare'
import ChorusFruit from 'common/cards/default/single-use/chorus-fruit'
import Knockback from 'common/cards/default/single-use/knockback'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import SkizzlemanRare from 'common/cards/season-x/hermits/skizzleman-rare'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import ProtectedEffect from 'common/status-effects/protected'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Jimmy "The Law"', () => {
	test('The Law functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'primary')
					yield* pick(
						game,
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
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(SolidaritygamingRare.health - EthosLabCommon.secondary.damage)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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
					yield* endTurn(game)

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

	test("Sheriff's Protection can only protect one hermit per side", () => {
		testGame(
			{
				playerOneDeck: [SolidaritygamingRare, EthosLabCommon],
				playerTwoDeck: [
					SolidaritygamingRare,
					SolidaritygamingRare,
					ArmorStand,
					ChorusFruit,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 0)
					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 1)
					yield* playCardFromHand(game, ArmorStand, 'hermit', 2)
					yield* attack(game, 'primary')
					yield* pick(
						game,
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
					yield* endTurn(game)

					yield* attack(game, 'primary')
					yield* pick(
						game,
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
					yield* endTurn(game)

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
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'primary')
					yield* pick(
						game,
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
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
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
					yield* attack(game, 'primary')
					yield* pick(
						game,
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

	test("Sheriff's Protection protects against Fire + Egg + Gas Light", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, SolidaritygamingRare],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)
					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.index).toBe(0)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 40 /* 2x Burn damage*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Sheriff's Protection does not expire when row is activated by Knockback", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Knockback],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)
					yield* changeActiveHermit(game, 0)
					yield* endTurn(game)

					yield* endTurn(game)
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

	test("Sheriff's Protection still expires when row is deactivated by Knockback", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Knockback],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon, ChorusFruit],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* pick(
						game,
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
					yield* endTurn(game)

					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* endTurn(game)

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

	test("Sheriff's Protection works after previous active was KO'd by Extra Flee", () => {
		testGame(
			{
				playerOneDeck: [SolidaritygamingRare, EthosLabCommon],
				playerTwoDeck: [TangoTekRare],
				saga: function* (game) {
					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

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

	test("Sheriff's Protection expires correctly after defending against Peace Out + Egg", () => {
		testGame(
			{
				playerOneDeck: [IJevinRare, Egg, Egg],
				playerTwoDeck: [SolidaritygamingRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, IJevinRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, SolidaritygamingRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'primary')
					yield* pick(
						game,
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
					yield* endTurn(game)

					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')
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
						query.slot.rowIndex(0),
					)
					yield* endTurn(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(ProtectedEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, Egg, 'single_use')
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
					yield* endTurn(game)

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
