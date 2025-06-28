import {describe, expect, test} from '@jest/globals'
import Allay from 'common/cards/advent-of-tcg/single-use/allay'
import {IronArmor} from 'common/cards/attach/armor'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import Clock from 'common/cards/single-use/clock'
import Composter from 'common/cards/single-use/composter'
import {Card} from 'common/cards/types'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../../utils'

function testAllayRetrieval(card: Card, canRetrieve: boolean) {
	test(`Allay ${canRetrieve ? 'can' : 'can not'} retrieve ${card.name}`, async () => {
		await testGame({
			playerOneDeck: [
				EthosLabCommon,
				Composter,
				...Array(3).fill(card),
				Allay,
				Allay,
			],
			playerTwoDeck: [EthosLabCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(Composter, 'single_use')
				await test.pick(
					game.state.pickRequests[0].canPick,
					query.slot.currentPlayer,
					query.slot.has(card),
				)
				await test.pick(
					game.state.pickRequests[0].canPick,
					query.slot.currentPlayer,
					query.slot.has(card),
				)
				await test.endTurn()
				expect(
					game.opponentPlayer
						.getHand()
						.sort(CardComponent.compareOrder)
						.map((card) => card.props),
				).toStrictEqual([card, Allay, Allay])

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				if (canRetrieve) {
					await test.playCardFromHand(Allay, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hand,
						query.slot.has(card),
					)
					await test.finishModalRequest({result: false, cards: null})
					expect(
						game.currentPlayer
							.getHand()
							.sort(CardComponent.compareOrder)
							.map((card) => card.props),
					).toStrictEqual([card, Allay, card])
					// Allay allows playing another single use
					expect(game.state.turn.availableActions).toContain(
						'PLAY_SINGLE_USE_CARD',
					)
				} else {
					expect(game.getPickableSlots(Allay.attachCondition)).toStrictEqual([])
				}
			},
		})
	})
}

describe('Test Allay Single Use', () => {
	testAllayRetrieval(EthosLabCommon, false) // Hermit
	testAllayRetrieval(BalancedItem, false) // Item
	testAllayRetrieval(Clock, false) // Clock should never be retrieved from a discard pile by any means
	testAllayRetrieval(Allay, false) // Prevent infinite loop
	testAllayRetrieval(IronArmor, true) // Attach
	testAllayRetrieval(Composter, true) // SingleUse
	testAllayRetrieval(ArmorStand, true) // Attach & HasHealth
})
