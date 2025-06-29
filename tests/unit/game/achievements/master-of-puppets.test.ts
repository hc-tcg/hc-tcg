import {describe, expect, test} from '@jest/globals'
import MasterOfPuppets from 'common/achievements/master-of-puppets'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import RendogRare from 'common/cards/hermits/rendog-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Master of Puppets Achievement', () => {
	test('Test achievement is gained after using both Ren and Cleo to mimic attack', async () => {
		await testAchivement(
			{
				achievement: MasterOfPuppets,
				playerOneDeck: [RendogRare, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare],
				playGame: async (test, game) => {
					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.rowIndex(0),
						query.slot.hermit,
						query.slot.opponent,
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					await test.finishModalRequest({pick: 'primary'})

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(MasterOfPuppets.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Test achievement is not gained after using only Cleo', async () => {
		await testAchivement(
			{
				achievement: MasterOfPuppets,
				playerOneDeck: [ZombieCleoRare, ZombieCleoRare],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 1)
					await test.endTurn()
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					await test.finishModalRequest({pick: 'primary'})

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(MasterOfPuppets.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
