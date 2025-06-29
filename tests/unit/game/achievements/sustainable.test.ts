import {describe, expect, test} from '@jest/globals'
import SUStainable from 'common/achievements/sustainable'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Composter from 'common/cards/single-use/composter'
import {SlotComponent} from 'common/components'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test SUStainable achivement', () => {
	test('Test SUStainable achivement', async () => {
		await testAchivement(
			{
				achievement: SUStainable,
				playerOneDeck: [
					EthosLabCommon,
					Composter,
					Composter,
					Composter,
					Composter,
					Composter,
				],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Composter, 'single_use')

					let cards = game.components.filterEntities(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hand,
						query.not(query.slot.empty),
					)
					await test.pick(query.slot.entity(cards[0]))
					await test.pick(query.slot.entity(cards[1]))

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(SUStainable.getProgress(achievement.goals)).toBe(2)
				},
			},
			{startWithAllCards: false},
		)
	})
})
