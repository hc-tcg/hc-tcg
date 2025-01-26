import {CARDS} from 'common/cards'
import {Deck, LegacyDeck, Tag} from 'common/types/deck'
import {toLocalCardInstance} from 'common/utils/cards'
import {generateDatabaseCodeWithSeed} from 'common/utils/database-codes'

export const getActiveDeckCode = (): string | null => {
	const deck = localStorage.getItem('activeDeck')
	if (!deck) return null
	return deck
}

export const setActiveDeck = (deck: Deck) => {
	localStorage.setItem('activeDeck', deck.code)
}

function getLocalStorageTags(): Array<Tag> {
	let lsKey
	const tags: Array<Tag> = []

	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Tag_')) {
			const key = localStorage.getItem(lsKey)
			if (key) {
				try {
					const parsedTag = JSON.parse(key) as Tag
					const newTag: Tag = {
						name: parsedTag.name,
						color: parsedTag.color,
						key: parsedTag.key,
					}
					tags.push(newTag)
				} catch {
					console.log(`Tag could not be parsed: "${key}"`)
				}
			}
		}
	}

	return tags
}

export function getLocalStorageDecks(): Array<Deck> {
	let lsKey
	const decks: Array<Deck> = []
	const tags = getLocalStorageTags()

	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Deck_')) {
			const key = localStorage.getItem(lsKey)
			if (key) {
				try {
					const parsedDeck = JSON.parse(key) as LegacyDeck
					const newDeck: Deck = {
						code: parsedDeck.code
							? parsedDeck.code
							: generateDatabaseCodeWithSeed(
									parsedDeck.name +
										parsedDeck.cards.reduce((r, card) => r + card.cardId, ''),
								),
						name: parsedDeck.name,
						iconType: 'item',
						icon: parsedDeck.icon,
						tags: parsedDeck.tags
							? parsedDeck.tags
									.map((tag) => {
										const foundTag = tags.find((search) => search.key === tag)
										if (foundTag) {
											// Turn old key into database readable format
											const newTag = (Number(foundTag.key) * 9999999)
												.toString(16)
												.slice(0, 7)
											return {
												key: newTag,
												color: foundTag.color,
												name: foundTag.name,
											}
										} else {
											return undefined
										}
									})
									.filter((tag) => tag !== undefined)
							: [],
						cards: parsedDeck.cards.map((card) => {
							if (card.cardId === 'flint_&_steel') {
								return toLocalCardInstance(CARDS['flint_and_steel'])
							}
							return toLocalCardInstance(CARDS[card.cardId])
						}),
						public: false,
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
	const hash = 'Deck_' + deck.code
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

export const deleteDeckFromLocalStorage = (deck: Deck) => {
	// First tries to remove by code. If it can't find code, it assumes the deck is saved by name
	// This could obviously cause issues but I believe ensuring compatibility with old version is more import
	const codeHash = 'Deck_' + deck.code
	const nameHash = 'Deck_' + deck.name
	if (localStorage.getItem(codeHash)) {
		localStorage.removeItem(codeHash)
	} else {
		localStorage.removeItem(nameHash)
	}
}
