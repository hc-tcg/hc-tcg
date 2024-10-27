import {CARDS} from 'common/cards'
import {Deck as Deck, LegacyDeck} from 'common/types/deck'
import {toLocalCardInstance} from 'common/utils/cards'
import {generateDatabaseCode} from 'common/utils/database-codes'

export const getActiveDeck = (): Deck | null => {
	const deck = localStorage.getItem('activeDeck')
	if (!deck) return null
	return JSON.parse(deck) as Deck
}

export const setActiveDeck = (deck: Deck) => {
	localStorage.setItem('activeDeck', JSON.stringify(deck))
}

export function getLocalStorageDecks(): Array<Deck> {
	let lsKey
	const decks: Array<Deck> = []

	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Deck_')) {
			const key = localStorage.getItem(lsKey)
			if (key) {
				try {
					const parsedDeck = JSON.parse(key) as LegacyDeck
					const newDeck: Deck = {
						code: parsedDeck.code ? parsedDeck.code : generateDatabaseCode(),
						name: parsedDeck.name,
						icon: parsedDeck.icon,
						tags: [],
						cards: parsedDeck.cards.map((card) =>
							toLocalCardInstance(CARDS[card.cardId]),
						),
					}
					decks.push(newDeck)
				} catch {
					console.log(`Deck could not be parsed: "${key}"`)
				}
			}
		}
	}

	return decks.sort()
}

// Both these functions below are only used for testing, so new contributors do NOT need to set up a database.
export function saveDeckToLocalStorage(deck: Deck) {
	const hash = 'Deck_' + deck.name
	const legacyDeck: LegacyDeck = {
		name: deck.name,
		cards: deck.cards.map((card) => ({
			cardId: card.props.id,
			cardInstance: Math.random().toString(),
		})),
		icon: deck.icon as LegacyDeck['icon'],
		code: deck.code,
		// Without a database, tags are disabled for simplicity
		tags: [],
	}
	localStorage.setItem(hash, JSON.stringify(legacyDeck))
}

export const deleteDeckFromLocalStorage = (name: string) => {
	const hash = 'Deck_' + name
	localStorage.removeItem(hash)
}
