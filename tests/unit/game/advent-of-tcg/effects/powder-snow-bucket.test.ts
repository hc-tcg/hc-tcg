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
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Powder Snow Bucket', () => {
	test('Frozen effect prevents attack damage and activating row', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PowderSnowBucket],
				playerTwoDeck: [EthosLabCommon, Bow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'single-use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

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

	test("Knockback and Egg can not be used when opponent's AFK Hermits are Frozen", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PowderSnowBucket],
				playerTwoDeck: [EthosLabCommon, Knockback, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					expect(
						game.getPickableSlots(Knockback.attachCondition),
					).toStrictEqual([])
					expect(game.getPickableSlots(Egg.attachCondition)).toStrictEqual([])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Powder Snow disables switching for Peace Out, Chorus Fruit and Let's Go", () => {
		testGame(
			{
				playerOneDeck: [Cubfan135Rare, EthosLabCommon, ChorusFruit],
				playerTwoDeck: [IJevinRare, PowderSnowBucket],
				saga: function* (game) {
					yield* playCardFromHand(game, Cubfan135Rare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, IJevinRare, 'hermit', 0)
					yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					yield* endTurn(game)

					expect(
						game.getPickableSlots(ChorusFruit.attachCondition),
					).toStrictEqual([])
					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Frozen hermits still take status effect damage', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, SplashPotionOfPoison, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
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
					).toBe(EthosLabCommon.health - 20 /** Burn */ * 2)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /** Poison */)
					yield* endTurn(game)

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

	test('Frozen Berry Bush cannot be damaged, but still removes its health each turn', () => {
		testGame({
			playerOneDeck: [EthosLabCommon],
			playerTwoDeck: [EthosLabCommon, BerryBush, PowderSnowBucket, Bow],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(
					game,
					BerryBush,
					'hermit',
					1,
					game.opponentPlayerEntity,
				)
				yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
				yield* pick(
					game,
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				yield* endTurn(game)

				expect(
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(1),
					)?.health,
				).toBe(BerryBush.health - 10)
				yield* endTurn(game)

				yield* playCardFromHand(game, Bow, 'single_use')
				yield* attack(game, 'single-use')
				yield* pick(
					game,
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				expect(game.currentPlayer.getHand()).toStrictEqual([])
				yield* endTurn(game)

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

	test('Extra Flee does not switch Hermits while AFK Hermits are Frozen', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, PowderSnowBucket],
				playerTwoDeck: [TangoTekRare, EthosLabCommon, PowderSnowBucket],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, PowderSnowBucket, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.lives).toBe(2)
					expect(game.opponentPlayer.activeRow).toBe(null)
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.state.pickRequests).toStrictEqual([])
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
