import {describe, expect, test} from '@jest/globals'
import Channeling from 'common/achievements/channeling'
import LightningRod from 'common/cards/attach/lightning-rod'
import BdoubleO100Rare from 'common/cards/hermits/bdoubleo100-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
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
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
					yield* endTurn(game)

					await test.playCardFromHand(GoatfatherRare, 'hermit', 0)
					await test.playCardFromHand(Anvil, 'single_use')
					game.opponentPlayer.activeRow!.health = 90
					await test.attack('secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('"Channeling" does not increase if the lightning rod didn\'t redirect damage from active Hermit', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [BdoubleO100Rare, Anvil],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
					yield* endTurn(game)

					await test.playCardFromHand(BdoubleO100Rare, 'hermit', 1)
					await test.playCardFromHand(Anvil, 'single_use')
					game.opponentPlayer.activeRow!.health = 90
					await test.attack('secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
	test('"Channeling" does not increase if the active Hermit has at least 100hp', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [GoatfatherRare, Anvil],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 1)
					yield* endTurn(game)

					await test.playCardFromHand(GoatfatherRare, 'hermit', 1)
					await test.playCardFromHand(Anvil, 'single_use')
					game.opponentPlayer.activeRow!.health = 100
					await test.attack('secondary')

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
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(LightningRod, 'attach', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					game.opponentPlayer.activeRow!.health = 10
					await test.attack('secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true},
		)
	})
})
