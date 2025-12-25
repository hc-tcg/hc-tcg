import {describe, expect, test} from '@jest/globals'
import PistonExtender from 'common/achievements/piston-extender'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Knockback from 'common/cards/single-use/knockback'
import Piston from 'common/cards/single-use/piston'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Double Piston Extender Achievement', () => {
	test('Check crash from Knockback to Hermit with items', async () => {
		await testAchivement({
			achievement: PistonExtender,
			playerOneDeck: [EthosLabCommon, EthosLabCommon, BalancedItem],
			playerTwoDeck: [EthosLabCommon, BalancedItem, Knockback],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(BalancedItem, 'item', 1, 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				await test.playCardFromHand(Knockback, 'single_use')
				await test.attack('primary')
				await test.pick(
					query.slot.opponent,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				await test.endTurn()

				await test.forfeit(game.currentPlayer.entity)
			},
			checkAchivement(_game, achievement, outcome) {
				expect(outcome.type).toBe('player-won')
				expect(PistonExtender.getProgress(achievement.goals)).toBe(1)
			},
		})
	})

	test('Check using Piston then switching counts as two progress', async () => {
		await testAchivement({
			achievement: PistonExtender,
			playerOneDeck: [EthosLabCommon, EthosLabCommon, BalancedItem, Piston],
			playerTwoDeck: [EthosLabCommon],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)

				await test.playCardFromHand(Piston, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.rowIndex(0),
					query.slot.index(0),
				)
				await test.pick(
					query.slot.currentPlayer,
					query.slot.rowIndex(1),
					query.slot.index(0),
				)

				await test.changeActiveHermit(1)
				await test.endTurn()

				await test.forfeit(game.currentPlayer.entity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(PistonExtender.getProgress(achievement.goals)).toBe(2)
			},
		})
	})
})
