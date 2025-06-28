import {describe, expect, test} from '@jest/globals'
import Wipeout from 'common/achievements/wipeout'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Anvil from 'common/cards/single-use/anvil'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	forfeit,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test "Wipeout" achievement', () => {
	test('Works when game ends when all Hermits are knocked out and game ends', () => {
		testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(3)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Works when some hermits live', () => {
		testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Works when killed by Lava Bucket', () => {
		testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, LavaBucket],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					await test.playCardFromHand(LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.attack('secondary')
					yield* endTurn(game)

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{noItemRequirements: true},
		)
	})
	test('Only counts the highest number of knock-outs in one round', () => {
		testAchivement(
			{
				achievement: Wipeout,
				playerOneDeck: [EthosLabCommon, Anvil],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					await test.attack('secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Wipeout.getProgress(achievement.goals)).toEqual(2)
				},
			},
			{noItemRequirements: true},
		)
	})
})
