import {describe, expect, test} from '@jest/globals'
import SpaceRace from 'common/achievements/space-race'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/hermits/ethoslab-rare'
import RenbobRare from 'common/cards/hermits/renbob-rare'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Space Race', () => {
	test('Test Space Race increments when Rendog kills two hermits', async () => {
		await testAchivement(
			{
				achievement: SpaceRace,
				playerOneDeck: [RenbobRare, EnderPearl],
				playerTwoDeck: [EthosLabCommon, EthosLabRare],
				playGame: async (test, _game) => {
					await test.playCardFromHand(RenbobRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabRare, 'hermit', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.currentPlayer,
						query.slot.hermit,
					)
					await test.attack('secondary')
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SpaceRace.getProgress(achievement.goals)).toBe(2)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
