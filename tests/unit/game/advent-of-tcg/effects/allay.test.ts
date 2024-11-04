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
import {
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

function testAllayRetrieval(card: Card, canRetrieve: boolean) {
	test(`Allay ${canRetrieve ? 'can' : 'can not'} retrieve ${card.name}`, () => {
		testGame({
			playerOneDeck: [
				EthosLabCommon,
				Composter,
				...Array(3).fill(card),
				Allay,
				Allay,
			],
			playerTwoDeck: [EthosLabCommon],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, Composter, 'single_use')
				yield* pick(
					game,
					game.state.pickRequests[0].canPick,
					query.slot.currentPlayer,
					query.slot.has(card),
				)
				yield* pick(
					game,
					game.state.pickRequests[0].canPick,
					query.slot.currentPlayer,
					query.slot.has(card),
				)
				yield* endTurn(game)
				expect(
					game.opponentPlayer
						.getHand()
						.sort(CardComponent.compareOrder)
						.map((card) => card.props),
				).toStrictEqual([card, Allay, Allay])

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				if (canRetrieve) {
					yield* playCardFromHand(game, Allay, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hand,
						query.slot.has(card),
					)
					yield* finishModalRequest(game, {result: false, cards: null})
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
