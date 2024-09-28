import {describe, expect, test} from '@jest/globals'
import BigBSt4tzRare from 'common/cards/advent-of-tcg/hermits/bigbst4tz2-rare'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'
import Thorns from 'common/cards/default/effects/thorns'
import Totem from 'common/cards/default/effects/totem'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GoodTimesWithScarRare from 'common/cards/default/hermits/goodtimeswithscar-rare'
import ZombieCleoRare from 'common/cards/default/hermits/zombiecleo-rare'
import ChorusFruit from 'common/cards/default/single-use/chorus-fruit'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import IronSword from 'common/cards/default/single-use/iron-sword'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {soulmateEffectDamage} from 'common/status-effects/soulmate'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test BigB Soulmate', () => {
	test('Soulmate functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - BigBSt4tzRare.secondary.damage)
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10

					yield* attack(game, 'secondary')
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

	test('Soulmate does not deal extra damage when revived by Totem', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [BigBSt4tzRare, Totem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 0)
					yield* playCardFromHand(game, Totem, 'attach', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10

					yield* attack(game, 'secondary')
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

	test('Disabled Totem does not prevent extra Soulmate damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, GoldenAxe],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, Totem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Totem, 'attach', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10

					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')
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

	test('Soulmate + Thorns does not knock-out hermit as it is revived', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Totem],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, Thorns],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Totem, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Thorns, 'attach', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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

					yield* attack(game, 'secondary')
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

	test('Soulmate causing double knock-out when triggered by Burn', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LavaBucket],
				playerTwoDeck: [BigBSt4tzRare, EthosLabCommon, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

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
					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					// TODO: Decide if this is desired behavior
					expect(game.currentPlayer.activeRow).toBe(null)
					expect(game.opponentPlayer.activeRow).toBe(null)

					yield* changeActiveHermit(game, 1)
					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	// Test interactions with Grianch which allows two attacks in one turn
	test('Soulmate does not deal extra damage when revived by Deathloop', () => {
		testGame(
			{
				playerOneDeck: [GrianchRare, EthosLabCommon],
				playerTwoDeck: [
					ZombieCleoRare,
					BigBSt4tzRare,
					GoodTimesWithScarRare,
					BadOmen,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, BigBSt4tzRare, 'hermit', 1)
					yield* playCardFromHand(game, GoodTimesWithScarRare, 'hermit', 2)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					// Manually set BigB health to trigger zone
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(0),
					)!.health = 10
					yield* attack(game, 'secondary')
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
