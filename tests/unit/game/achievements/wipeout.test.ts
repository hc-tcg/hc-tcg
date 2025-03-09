import {describe} from 'node:test'
import {expect, test} from '@jest/globals'
import Wipeout from 'common/achievements/wipeout'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Anvil from 'common/cards/single-use/anvil'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	attack,
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
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')

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
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					game.components
						.filter(RowComponent, query.row.hasHermit)
						.forEach((row) => (row.health = 10))
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, Anvil, 'single_use')

					yield* endTurn(game)
					yield* attack(game, 'secondary')

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
