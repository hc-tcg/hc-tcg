import {CARDS} from 'common/cards'
import {CardEntity} from 'common/entities'
import {Deck} from 'common/types/database'
import {PlayerDeck as PlayerDeck, LegacyDeck} from 'common/types/deck'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {generateDatabaseCode} from 'common/utils/database-codes'

export const getActiveDeck = (): Deck | null => {
	const deck = localStorage.getItem('activeDeck')
	if (!deck) return null
	return JSON.parse(deck) as Deck
}

export const setActiveDeck = (deck: Deck) => {
	localStorage.setItem('activeDeck', JSON.stringify(deck))
}

export function toSavedDeck(deck: PlayerDeck): Deck {
	return {
		name: deck.name,
		code: deck.code,
		icon: deck.icon,
		tags: deck.tags,
		cards: deck.cards.map((card) => CARDS[card.props.id]),
	}
}

export function toPlayerDeck(deck: Deck): PlayerDeck {
	return {
		name: deck.name,
		icon: deck.icon as PlayerDeck['icon'],
		tags: deck.tags ? deck.tags : [],
		code: deck.code,
		cards: deck.cards.map((card): LocalCardInstance => {
			return {
				props: WithoutFunctions(card),
				entity: Math.random().toString() as CardEntity,
				slot: null,
				attackHint: null,
				turnedOver: false,
			}
		}),
	}
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
						code: generateDatabaseCode(),
						name: parsedDeck.name,
						icon: parsedDeck.icon,
						tags: [],
						cards: parsedDeck.cards.map((card) => CARDS[card.cardId]),
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
