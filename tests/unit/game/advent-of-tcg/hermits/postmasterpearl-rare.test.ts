import {describe, expect, test} from '@jest/globals'
import PostmasterPearlRare from 'common/cards/advent-of-tcg/hermits/postmasterpearl-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/hermits/ethoslab-rare'
import EthosLabUltraRare from 'common/cards/hermits/ethoslab-ultra-rare'
import ShadeEERare from 'common/cards/hermits/shadeee-rare'
import {Card} from 'common/cards/types'
import {CardComponent} from 'common/components'
import {SelectCards} from 'common/types/modal-requests'
import {
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'

const deck = [
	...Array(7).fill(PostmasterPearlRare),
	EthosLabCommon,
	EthosLabRare,
	EthosLabUltraRare,
	ShadeEERare,
]

function postMasterTest(pearls: number, results: boolean[]) {
	test(`Test ${pearls} pearl card(s) with ${results}`, () =>
		testGame({
			playerOneDeck: deck,
			playerTwoDeck: deck,
			saga: function* (game) {
				let drawnCard: Card | undefined = EthosLabCommon
				for (let i = 0; i < pearls; i++) {
					yield* playCardFromHand(game, PostmasterPearlRare, 'hermit', i)
				}
				yield* endTurn(game)
				for (let i = 0; i < results.length; i++) {
					expect(game.state.modalRequests).toHaveLength(1)
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([drawnCard])
					if (results[i])
						drawnCard = game.opponentPlayer
							.getDeck()
							.sort(CardComponent.compareOrder)
							.at(0)?.props
					yield* finishModalRequest(game, {result: results[i], cards: null})
				}
				expect(game.state.modalRequests).toHaveLength(0)
				expect(
					game.opponentPlayer
						.getHand()
						.sort(CardComponent.compareOrder)
						.map((card) => card.props),
				).toStrictEqual([
					...Array(7 - pearls).fill(PostmasterPearlRare),
					drawnCard,
				])
			},
		}))
}

describe('Test Postmaster Pearl', () => {
	postMasterTest(1, [false])
	postMasterTest(1, [true])
	postMasterTest(2, [false])
	postMasterTest(2, [true, false])
	postMasterTest(2, [true, true])
	postMasterTest(3, [false])
	postMasterTest(3, [true, false])
	postMasterTest(3, [true, true, false])
	postMasterTest(3, [true, true, true])
})
