import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from './utils'
import NetheriteBoots from 'common/cards/alter-egos-iii/effects/netherite-boots'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import FireEffect from 'common/status-effects/fire'
import PoultryManRare from 'common/cards/alter-egos-iii/hermits/poultryman-rare'
import TangoTekCommon from 'common/cards/default/hermits/tangotek-common'
import Egg from 'common/cards/alter-egos/single-use/egg'
import Knockback from 'common/cards/default/single-use/knockback'
import TargetBlock from 'common/cards/alter-egos/single-use/target-block'

describe('Test Netherite Boots', () => {
	test('Test Netherite Boots Prevents 20 Damage and Burn', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteBoots],
				playerTwoDeck: [EthosLabCommon, LavaBucket],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteBoots, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)

					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
						),
					).not.toBeNull()

					yield* endTurn(game)

					// We are immune to burn so we do not take damage from it.
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.currentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Netherite Boots prevents knockback from Egg.', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, TangoTekCommon, NetheriteBoots],
				playerTwoDeck: [EthosLabCommon, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteBoots, 'attach', 0)
					yield* playCardFromHand(game, TangoTekCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Egg, 'single_use')

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.rowIndex(1),
						query.slot.hermit,
					)

					expect(
						game.components.find(RowComponent, query.row.active)?.index,
					).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Netherite Boots prevents knockback from ', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, TangoTekCommon, NetheriteBoots],
				playerTwoDeck: [EthosLabCommon, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteBoots, 'attach', 0)
					yield* playCardFromHand(game, TangoTekCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Knockback, 'single_use')

					yield* attack(game, 'secondary')

					expect(game.hasActiveRequests()).toBe(false)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Netherite Boots prevent damage redirect', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, NetheriteBoots],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, NetheriteBoots, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.opponent,
						query.slot.hermit,
					)
					yield* attack(game, 'secondary')

          expect(game.components.find(RowComponent, query.row.index(0), query.row.opponentPlayer)?.health).toBe(EthosLabCommon.health)
          expect(game.components.find(RowComponent, query.row.index(1), query.row.opponentPlayer)?.health).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
