import {CARDS} from 'common/cards'
import {CardEntity} from 'common/entities'
import {Deck} from 'common/types/database'
import {PlayerDeck as PlayerDeck, Tag} from 'common/types/deck'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'

export const getActiveDeck = (): Deck | null => {
	const deck = localStorage.getItem('activeDeck')
	if (!deck) return null
	return JSON.parse(deck) as Deck
}

export const setActiveDeck = (deck: Deck) => {
	localStorage.setItem('activeDeck', JSON.stringify(deck))
}

export const getLegacyDecks = () => {
	for (let i = 0; i < localStorage.length; i++) {
		const lsKey = localStorage.key(i)

		if (lsKey?.includes('Loadout_')) return true
	}
	return false
}
export const convertLegacyDecks = (): number => {
	let conversionCount = 0
	for (let i = 0; i < localStorage.length; i++) {
		const lsKey = localStorage.key(i)

		if (lsKey?.includes('Loadout_')) {
			conversionCount = conversionCount + 1
			const legacyName = lsKey.replace('Loadout_', '[Legacy] ')
			const legacyDeck = localStorage.getItem(lsKey)

			const convertedDeck = {
				name: legacyName,
				icon: 'any',
				cards: JSON.parse(legacyDeck || ''),
			}

			localStorage.setItem(`Deck_${legacyName}`, JSON.stringify(convertedDeck))

			localStorage.removeItem(lsKey)
			console.log('Converted deck:', lsKey, legacyName)
		}
	}

	return conversionCount
}

export function toSavedDeck(deck: PlayerDeck): Deck {
	return {
		name: deck.name,
		code: Math.random.toString(),
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
