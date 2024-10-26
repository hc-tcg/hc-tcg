import {Card} from '../cards/base/types'
import {RankT, TokenCostT} from '../types/cards'

export function getCardVisualTokenCost(
	tokens: TokenCostT,
): -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 {
	if (tokens === 'wild') return 1
	return tokens
}

export function getCardRank(tokens: TokenCostT): RankT {
	let displayCost = getCardVisualTokenCost(tokens)
	if (displayCost === 0) {
		return 'stone'
	} else if (displayCost === 1) {
		return 'iron'
	} else if (displayCost === 2) {
		return 'gold'
	} else if (displayCost === 3) {
		return 'emerald'
	} else if (displayCost === 4) {
		return 'diamond'
	} else if (displayCost >= 5) {
		return 'obsidian'
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
