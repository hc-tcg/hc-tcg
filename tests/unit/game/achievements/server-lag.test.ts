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
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Server Lag achievement', () => {
	test('Test "Server Lag" knock-out-win with secondary Succeeds', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
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

	test('Test "Server Lag" knock-out-tie with secondary Succeeds', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, StressMonster101Rare, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* attack(game, 'secondary')
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

	test('Test "Server Lag" knock-out-loss with secondary Succeeds', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, ZedaphPlaysRare, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* attack(game, 'secondary')
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

	test('Test "Server Lag" deck-out-loss with secondary Succeeds', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.opponentPlayer.getDrawPile().length).not.toBe(0)
					yield* attack(game, 'secondary')
					expect(game.currentPlayer.getDrawPile().length).toBe(0)
					yield* endTurn(game)
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

	test('Test "Server Lag" knock-out-win with Burn Succeeds', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, Totem, 'attach', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)
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

	test('Test "Server Lag" knock-out-win with secondary + sword Succeeds', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')
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

	test('Test "Server Lag" forfeit-win before turn end Succeeds', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* forfeit(game.opponentPlayerEntity)
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

	test('Test "Server Lag" forfeit-loss Fails', () => {
		testAchivement(
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
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* forfeit(game.currentPlayerEntity)
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
