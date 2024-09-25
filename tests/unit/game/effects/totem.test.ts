import {describe, expect, test} from '@jest/globals'
import Thorns from 'common/cards/default/effects/thorns'
import Totem from 'common/cards/default/effects/totem'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GoodTimesWithScarRare from 'common/cards/default/hermits/goodtimeswithscar-rare'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import PearlescentMoonCommon from 'common/cards/default/hermits/pearlescentmoon-common'
import WelsknightCommon from 'common/cards/default/hermits/welsknight-common'
import Bow from 'common/cards/default/single-use/bow'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import TNT from 'common/cards/default/single-use/tnt'
import {
	CardComponent,
	RowComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import {RevivedByDeathloopEffect} from 'common/status-effects/death-loop'
import FireEffect from 'common/status-effects/fire'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Totem of Undying', () => {
	test('Test Totem with TNT', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [PearlescentMoonCommon, WelsknightCommon, Totem, TNT],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, PearlescentMoonCommon, 'hermit', 0)
					yield* playCardFromHand(game, WelsknightCommon, 'hermit', 1)

					yield* playCardFromHand(game, Totem, 'attach', 0)
					yield* playCardFromHand(game, TNT, 'single_use')

					// Manually set Pearl health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10

					yield* attack(game, 'primary')

					// We expect that the Totem attached to Pearl to be discarded after reviving to 10hp.
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toBe(10)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Totem),
							query.card.attached,
						),
					).toBeFalsy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Totem with Thorns', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Thorns],
				playerTwoDeck: [PearlescentMoonCommon, WelsknightCommon, Totem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Thorns, 'attach', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, PearlescentMoonCommon, 'hermit', 0)
					yield* playCardFromHand(game, WelsknightCommon, 'hermit', 1)

					yield* playCardFromHand(game, Totem, 'attach', 0)

					// Manually set Pearl health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10

					yield* attack(game, 'primary')

					// We expect that the Totem attached to Pearl to be discarded after reviving to 10hp.
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toBe(10)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Totem),
							query.card.attached,
						),
					).toBeFalsy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Totem with Deathloop', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Thorns],
				playerTwoDeck: [GoodTimesWithScarRare, WelsknightCommon, Totem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Thorns, 'attach', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, GoodTimesWithScarRare, 'hermit', 0)
					yield* playCardFromHand(game, WelsknightCommon, 'hermit', 1)

					yield* playCardFromHand(game, Totem, 'attach', 0)

					// Manually set Scar health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10

					yield* attack(game, 'secondary')

					// We expect Deathloop to have revived Scar to 50hp instead of Totem
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toBe(50)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(RevivedByDeathloopEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBeTruthy()
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Totem),
							query.card.attached,
						),
					).toBeTruthy()

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					// We expect that the Totem attached to Scar to be discarded after reviving to 10hp.
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(10)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Totem),
							query.card.attached,
						),
					).toBeFalsy()
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(RevivedByDeathloopEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).toBeTruthy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Totem with AFK Thorns', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Iskall85Common, Thorns, Thorns],
				playerTwoDeck: [PearlescentMoonCommon, WelsknightCommon, Totem, Bow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Iskall85Common, 'hermit', 1)

					yield* playCardFromHand(game, Thorns, 'attach', 0)
					yield* playCardFromHand(game, Thorns, 'attach', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, PearlescentMoonCommon, 'hermit', 0)
					yield* playCardFromHand(game, WelsknightCommon, 'hermit', 1)

					yield* playCardFromHand(game, Totem, 'attach', 0)
					yield* playCardFromHand(game, Bow, 'single_use')

					// Manually set Scar health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10

					yield* attack(game, 'primary')

					// Bow request
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					// We expect that the Totem attached to Pearl to be discarded after reviving to 10hp.
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toBe(10)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Totem),
							query.card.attached,
						),
					).toBeFalsy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Totem with Burn', () => {
		testGame(
			{
				playerOneDeck: [PearlescentMoonCommon, WelsknightCommon, Totem],
				playerTwoDeck: [EthosLabCommon, LavaBucket],
				saga: function* (game) {
					yield* playCardFromHand(game, PearlescentMoonCommon, 'hermit', 0)
					yield* playCardFromHand(game, WelsknightCommon, 'hermit', 1)

					yield* playCardFromHand(game, Totem, 'attach', 0)

					// Manually set Pearl health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.active,
					)!.health = 10

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, LavaBucket, 'single_use')

					yield* applyEffect(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).toBeTruthy()

					yield* endTurn(game)

					// We expect that the Totem attached to Pearl to be discarded after reviving to 10hp.
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toBe(10)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(Totem),
							query.card.attached,
						),
					).toBeFalsy()
					// Damage effects should be cleared on revival
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBeFalsy()
				},
			},
			{startWithAllCards: true},
		)
	})
})
