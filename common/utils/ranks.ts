import {RankT} from '../types/cards'
import {LocalCardInstance} from '../types/server-requests'

export function getCardRank(tokens: number | 'wild'): RankT {
	if (tokens === 0) {
		return 'stone'
	} else if (tokens === 1) {
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

export function getDeckCost(deckCards: Array<LocalCardInstance>) {
	let wildCards = deckCards.filter((card) => card.props.id === 'item_any_common').length
	let wildCost = Math.ceil(wildCards / 3)

	return (
		deckCards.reduce(
			(cost, card) => (cost += card.props.tokens !== 'wild' ? card.props.tokens : 0),
			0
		) + wildCost
	)
}
