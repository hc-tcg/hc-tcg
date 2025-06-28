import {describe, expect, test} from '@jest/globals'
import PeskyBird from 'common/achievements/pesky-bird'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import JinglerRare from 'common/cards/hermits/jingler-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import Composter from 'common/cards/single-use/composter'
import {SlotComponent} from 'common/components'
import query from 'common/components/query'
import {testAchivement} from '../utils'

describe('Test Pesky Bird Achievement', () => {
	test('Test achievement progress increases after forcing opponnet to discard card', async () => {
		await testAchivement(
			{
				achievement: PeskyBird,
				playerOneDeck: [JinglerRare],
				playerTwoDeck: [
					EthosLabCommon,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					BalancedItem,
				],
				playGame: async (test, game) => {
					await test.playCardFromHand(JinglerRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.hand,
						query.slot.opponent,
						query.not(query.slot.empty),
					)
					await test.endTurn()

					await test.forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(PeskyBird.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false, forceCoinFlip: true},
		)
	})
	test('Test achievement progress stays the same when you discard your own card', async () => {
		await testAchivement(
			{
				achievement: PeskyBird,
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
					expect(PeskyBird.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{startWithAllCards: false},
		)
	})
})
