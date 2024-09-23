import {Card} from '../cards/base/types'
import {RankT, TokenCostT} from '../types/cards'

export function getCardRank(tokens: TokenCostT): RankT {
	if (tokens === 0) {
		return 'stone'
	} else if (tokens === 1 || tokens === 'wild') {
		return 'iron'
	} else if (tokens === 2) {
		return 'gold'
	} else if (tokens === 3) {
		return 'emerald'
	} else if (tokens === 4) {
		return 'diamond'
	}
	return 'stone'
}

export function getDeckCost(deckCards: Array<Card>) {
	let wildCards = deckCards.filter(
		(card) => card.id === 'item_any_common',
	).length
	let wildCost = Math.max(wildCards - 3, 0)

	return (
		deckCards.reduce(
			(cost, card) => (cost += card.tokens !== 'wild' ? card.tokens : 0),
			0,
		) + wildCost
	)
}
