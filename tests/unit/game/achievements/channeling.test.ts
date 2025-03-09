import {describe, expect, test} from '@jest/globals'
import Channeling from 'common/achievements/channeling'
import {IronArmor, NetheriteArmor} from 'common/cards/attach/armor'
import LightningRod from 'common/cards/attach/lightning-rod'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import TinFoilChefUltraRare from 'common/cards/hermits/tinfoilchef-ultra-rare'
import Anvil from 'common/cards/single-use/anvil'
import {
	attack,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Channeling achievement', () => {
	test('"Channeling" increases properly', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [GoatfatherRare, Anvil],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 0)
					yield* playCardFromHand(game, Anvil, 'single_use')
					game.opponentPlayer.activeRow!.health = 140
					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('"Channeling" does not increase if the lightning rod didn\'t save any Hermit', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [GoatfatherRare, Anvil],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 1)
					yield* playCardFromHand(game, Anvil, 'single_use')
					game.opponentPlayer.activeRow!.health = 120
					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('"Channeling" does not increase if the lightning rod didn\'t save any Hermit because they had armor', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					LightningRod,
					NetheriteArmor,
				],
				playerTwoDeck: [GoatfatherRare, Anvil],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 0)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 0)
					yield* playCardFromHand(game, Anvil, 'single_use')
					game.opponentPlayer.activeRow!.health = 120
					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('"Channeling" does not increase when Lightning Rod on active row', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					game.opponentPlayer.activeRow!.health = 10
					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('"Channeling" increases when type-advantage + TFC "Take It Easy" heads would have caused a KO', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [
					GoatfatherRare,
					EthosLabCommon,
					IronArmor,
					LightningRod,
				],
				playerTwoDeck: [TinFoilChefUltraRare, Anvil],
				playGame: function* (game) {
					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, IronArmor, 'attach', 0)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, TinFoilChefUltraRare, 'hermit', 0)
					game.opponentPlayer.activeRow!.health = 120
					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
