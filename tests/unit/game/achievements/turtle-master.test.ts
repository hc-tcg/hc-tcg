import {describe, expect, test} from '@jest/globals'
import TurtleMaster from 'common/achievements/turtle-master'
import TurtleShell from 'common/cards/attach/turtle-shell'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Chest from 'common/cards/single-use/chest'
import CurseOfVanishing from 'common/cards/single-use/curse-of-vanishing'
import Emerald from 'common/cards/single-use/emerald'
import Ladder from 'common/cards/single-use/ladder'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Turtle Master Achievement', () => {
	test('Test achievement is gained by swapping away and back to hermit that had the loose shell status', async () => {
		await testAchivement({
			achievement: TurtleMaster,
			playerOneDeck: [EthosLabCommon, EthosLabCommon, Emerald],
			playerTwoDeck: [EthosLabCommon, EthosLabCommon, TurtleShell],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(TurtleShell, 'attach', 1)
				await test.changeActiveHermit(1)
				await test.endTurn()

				await test.playCardFromHand(Emerald, 'single_use')
				await test.applyEffect()
				await test.changeActiveHermit(1)
				await test.endTurn()

				await test.endTurn()

				await test.changeActiveHermit(0)
				await test.endTurn()

				await test.forfeit(game.currentPlayerEntity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(TurtleMaster.getProgress(achievement.goals)).toBe(1)
			},
		})
	})

	test('Test achievement detects loose shell status after using Ladder', async () => {
		await testAchivement({
			achievement: TurtleMaster,
			playerOneDeck: [EthosLabCommon, EthosLabCommon, TurtleShell, Ladder],
			playerTwoDeck: [EthosLabCommon],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
				await test.playCardFromHand(TurtleShell, 'attach', 1)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(Ladder, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				await test.changeActiveHermit(0)
				await test.endTurn()

				await test.endTurn()

				await test.changeActiveHermit(1)
				await test.endTurn()

				await test.forfeit(game.currentPlayerEntity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(TurtleMaster.getProgress(achievement.goals)).toBe(1)
			},
		})
	})

	test('Test achievement detects activating Turtle Shell that was loose on opponent', async () => {
		await testAchivement(
			{
				achievement: TurtleMaster,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Emerald],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, TurtleShell, Ladder],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TurtleMaster.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})

	test('Test achievement does not progress if loose shell was discarded before activation', async () => {
		await testAchivement(
			{
				achievement: TurtleMaster,
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					Ladder,
					Chest,
				],
				playerTwoDeck: [EthosLabCommon, CurseOfVanishing],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(CurseOfVanishing, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(Chest, 'single_use')
					await test.finishModalRequest({
						result: true,
						cards: game.components.filterEntities(
							CardComponent,
							query.card.is(TurtleShell),
						),
					})
					await test.playCardFromHand(TurtleShell, 'attach', 0)
					await test.changeActiveHermit(0)
					await test.endTurn()

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TurtleMaster.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{verboseLogging: true},
		)
	})
})
