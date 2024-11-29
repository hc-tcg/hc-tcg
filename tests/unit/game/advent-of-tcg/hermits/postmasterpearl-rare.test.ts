import {describe, expect, test} from '@jest/globals'
import PostmasterPearlRare from 'common/cards/advent-of-tcg/hermits/postmasterpearl-rare'
import {
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../../utils'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EthosLabRare from 'common/cards/hermits/ethoslab-rare'
import EthosLabUltraRare from 'common/cards/hermits/ethoslab-ultra-rare'
import ShadeEERare from 'common/cards/hermits/shadeee-rare'
import {Hermit} from 'common/cards/types'

const deck = [
	...Array(7).fill(PostmasterPearlRare),
	EthosLabCommon,
	EthosLabRare,
	EthosLabUltraRare,
	ShadeEERare,
]

function postMasterTest(pearls: number, results: boolean[], endResult: Hermit) {
	test(`Test ${pearls} pearl card(s) with ${results}`, () =>
		testGame({
			playerOneDeck: deck,
			playerTwoDeck: deck,
			saga: function* (game) {
				for (let i = 0; i < pearls; i++) {
					yield* playCardFromHand(game, PostmasterPearlRare, 'hermit', i)
				}
				yield* endTurn(game)
				for (let i = 0; i < pearls && results[i]; i++) {
					expect(game.state.modalRequests.length).toStrictEqual(1)
					yield* finishModalRequest(game, {result: results[i], cards: null})
				}
				expect(game.opponentPlayer.getHand().map((card) => card.props)).toStrictEqual([
					...Array(7 - pearls).fill(PostmasterPearlRare),
					endResult,
				])
			},
		}))
}

describe('Test Postmaster Pearl', () => {
	postMasterTest(1, [false], EthosLabCommon)
	postMasterTest(1, [true], EthosLabRare)
	postMasterTest(2, [false, false], EthosLabCommon)
	postMasterTest(2, [true, false], EthosLabRare)
	postMasterTest(2, [true, true], EthosLabUltraRare)
	postMasterTest(3, [false, false, false], EthosLabCommon)
	postMasterTest(3, [true, false, false], EthosLabRare)
	postMasterTest(3, [true, true, false], EthosLabUltraRare)
	postMasterTest(3, [true, true, true], ShadeEERare)
})
