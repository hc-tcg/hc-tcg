import {CARDS} from 'common/cards'
import {LegacyDeck, PlayerDeck as PlayerDeck} from 'common/types/deck'
import {toLocalCardInstance} from 'common/utils/cards'
import {generateDatabaseCode} from 'common/utils/database-codes'

export const getActiveDeck = (): PlayerDeck | null => {
	const deck = localStorage.getItem('activeDeck')
	if (!deck) return null
	return JSON.parse(deck) as PlayerDeck
}

export const setActiveDeck = (deck: PlayerDeck) => {
	localStorage.setItem('activeDeck', JSON.stringify(deck))
}

export function getLocalStorageDecks(): Array<PlayerDeck> {
	let lsKey
	const decks: Array<PlayerDeck> = []

	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Deck_')) {
			const key = localStorage.getItem(lsKey)
			if (key) {
				try {
					const parsedDeck = JSON.parse(key) as LegacyDeck
					const newDeck: PlayerDeck = {
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
export function saveDeckToLocalStorage(deck: PlayerDeck) {
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
