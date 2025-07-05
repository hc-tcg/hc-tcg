import {describe, expect, test} from '@jest/globals'
import ServerLag from 'common/achievements/server-lag'
import Totem from 'common/cards/attach/totem'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import StressMonster101Rare from 'common/cards/hermits/stressmonster101-rare'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import ZedaphPlaysRare from 'common/cards/hermits/zedaphplays-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import {IronSword} from 'common/cards/single-use/sword'
import {testAchivement} from '../utils'

describe('Test Server Lag achievement', () => {
	test('Test "Server Lag" knock-out-win with secondary Succeeds', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [EthosLabCommon, ...Array(9).fill(BalancedItem)],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					...Array(6).fill(BalancedItem),
					VintageBeefCommon,
					BalancedItem,
				],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.victoryReason).toBe('no-hermits-on-board')
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(ServerLag.getProgress(achievement.goals)).toBe(
						ServerLag.levels[0].steps,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true, startWithAllCards: false},
		)
	})

	test('Test "Server Lag" knock-out-tie with secondary Succeeds', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [EthosLabCommon, ...Array(9).fill(BalancedItem)],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					...Array(6).fill(BalancedItem),
					StressMonster101Rare,
					BalancedItem,
				],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(StressMonster101Rare, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('tie')
					expect(ServerLag.getProgress(achievement.goals)).toBe(
						ServerLag.levels[0].steps,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true, startWithAllCards: false},
		)
	})

	test('Test "Server Lag" knock-out-loss with secondary Succeeds', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [EthosLabCommon, ...Array(9).fill(BalancedItem)],
				playerTwoDeck: [
					VintageBeefCommon,
					ZedaphPlaysRare,
					...Array(6).fill(BalancedItem),
					VintageBeefCommon,
					BalancedItem,
				],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(ZedaphPlaysRare, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.endTurn()

					await test.attack('primary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.victoryReason).toBe('no-hermits-on-board')
						expect(outcome.winner).not.toBe(achievement.player)
					}
					expect(ServerLag.getProgress(achievement.goals)).toBe(
						ServerLag.levels[0].steps,
					)
				},
			},
			{
				oneShotMode: true,
				noItemRequirements: true,
				startWithAllCards: false,
				forceCoinFlip: true,
			},
		)
	})

	test('Test "Server Lag" deck-out-loss with secondary Succeeds', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [EthosLabCommon, ...Array(9).fill(BalancedItem)],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					...Array(5).fill(BalancedItem),
					VintageBeefCommon,
					...Array(3).fill(BalancedItem),
				],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 2)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					expect(game.opponentPlayer.getDrawPile().length).not.toBe(0)
					await test.attack('secondary')
					expect(game.currentPlayer.getDrawPile().length).toBe(0)
					await test.endTurn()
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.victoryReason).toBe('decked-out')
						expect(outcome.winner).not.toBe(achievement.player)
					}
					expect(ServerLag.getProgress(achievement.goals)).toBe(
						ServerLag.levels[0].steps,
					)
				},
			},
			{
				oneShotMode: true,
				noItemRequirements: true,
				startWithAllCards: false,
				disableDeckOut: false,
			},
		)
	})

	test('Test "Server Lag" knock-out-win with Burn Succeeds', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [
					EthosLabCommon,
					LavaBucket,
					...Array(9).fill(BalancedItem),
				],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					Totem,
					...Array(5).fill(BalancedItem),
					GeminiTayRare,
				],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(Totem, 'attach', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.victoryReason).toBe('no-hermits-on-board')
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(ServerLag.getProgress(achievement.goals)).toBe(
						ServerLag.levels[0].steps,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true, startWithAllCards: false},
		)
	})

	test('Test "Server Lag" knock-out-win with secondary + sword Succeeds', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [
					EthosLabCommon,
					IronSword,
					...Array(9).fill(BalancedItem),
				],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					...Array(6).fill(BalancedItem),
					VintageBeefCommon,
					BalancedItem,
				],
				playGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.victoryReason).toBe('no-hermits-on-board')
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(ServerLag.getProgress(achievement.goals)).toBe(
						ServerLag.levels[0].steps,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true, startWithAllCards: false},
		)
	})

	test('Test "Server Lag" forfeit-win before turn end Succeeds', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [EthosLabCommon, ...Array(9).fill(BalancedItem)],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					...Array(5).fill(BalancedItem),
					VintageBeefCommon,
					...Array(3).fill(BalancedItem),
				],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 2)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.forfeit(game.opponentPlayerEntity)
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.victoryReason).toBe('forfeit')
						expect(outcome.winner).toBe(achievement.player)
					}
					expect(ServerLag.getProgress(achievement.goals)).toBe(
						ServerLag.levels[0].steps,
					)
				},
			},
			{oneShotMode: true, noItemRequirements: true, startWithAllCards: false},
		)
	})

	test('Test "Server Lag" forfeit-loss Fails', async () => {
		await testAchivement(
			{
				achievement: ServerLag,
				playerOneDeck: [EthosLabCommon, ...Array(9).fill(BalancedItem)],
				playerTwoDeck: [
					VintageBeefCommon,
					VintageBeefCommon,
					VintageBeefCommon,
					...Array(5).fill(BalancedItem),
					VintageBeefCommon,
					...Array(3).fill(BalancedItem),
				],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 2)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, outcome) {
					expect(outcome.type).toBe('player-won')
					if (outcome.type === 'player-won') {
						expect(outcome.victoryReason).toBe('forfeit')
						expect(outcome.winner).not.toBe(achievement.player)
					}
					expect(ServerLag.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true, startWithAllCards: false},
		)
	})
})
