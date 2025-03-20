import {CARDS} from '../cards'
import {isHermit, isItem} from '../cards/types'
import {Deck} from '../types/deck'

export function sortDecks(
	decks: Array<Deck>,
	sortingMethod: 'Alphabetical' | 'First Tag',
	prioritizedDeckCode: string | null = null,
): Array<Deck> {
	return decks.sort((a, b) => {
		if (prioritizedDeckCode) {
			if (a.code === prioritizedDeckCode) {
				return -1
			}
			if (b.code === prioritizedDeckCode) {
				return 1
			}
		}
		if (sortingMethod === 'Alphabetical') {
			if (a.name === b.name) {
				return a.code.localeCompare(b.code)
			}
			return a.name.localeCompare(b.name)
		}
		if (sortingMethod === 'First Tag') {
			const aHasTags = a.tags && a.tags.length > 0
			const bHasTags = b.tags && b.tags.length > 0
			if (!aHasTags && !bHasTags) return a.name.localeCompare(b.name)
			if (!aHasTags && bHasTags) return 1
			if (aHasTags && !bHasTags) return 0
			const aFirstTag = a.tags![0].name
			const bFirstTag = b.tags![0].name
			return aFirstTag.localeCompare(bFirstTag)
		}
		//Default case so something is always returned
		return 0
	})
}

export const parseDeckCards = (cards: Array<string>) => {
	return cards.map((card) => CARDS[card])
}

export const getDeckTypes = (cards: Array<string>) => {
	const parsedCards = parseDeckCards(cards)
	const reducedCards = parsedCards.reduce((r: Array<string>, card) => {
		if (!isHermit(card) && !isItem(card)) return r
		if (!r.includes(card.type) && card.type !== 'any') r.push(card.type)
		return r
	}, [])
	return reducedCards.join(', ')
}
