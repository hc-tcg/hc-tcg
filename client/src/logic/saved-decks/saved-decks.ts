import {CARDS} from 'common/cards'
import {CardEntity} from 'common/entities'
import {Deck} from 'common/types/database'
import {EditedDeck as EditedDeck, Tag} from 'common/types/deck'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {validateDeck} from 'common/utils/validation'

export const getActiveDeckName = () => {
	return localStorage.getItem('activeDeck')
}

export const setActiveDeck = (name: string) => {
	localStorage.setItem('activeDeck', name)
}

export const isActiveDeckValid = () => {
	const activeDeckName = getActiveDeckName()
	const activeDeck = activeDeckName ? getSavedDeck(activeDeckName)?.cards : null
	const activeDeckValid = !!activeDeck && validateDeck(activeDeck).valid
	return activeDeckValid
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

export const getCreatedTags: () => Array<Tag> = () => {
	let lsKey
	const tags = []

	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Tag_')) {
			const key = localStorage.getItem(lsKey)
			if (key) tags.push(JSON.parse(key) || {})
		}
	}
	return tags.sort() as Array<Tag>
}

export const keysToTags = (tags: Array<string>): Array<Tag> => {
	const savedTags = getCreatedTags()
	const fullTags: Array<Tag> = []
	tags.forEach((key) => {
		const fullTag = savedTags.find((tag) => tag.key === key)
		if (fullTag) fullTags.push(fullTag)
	})
	return fullTags
}

export const saveTag = (tag: Tag) => {
	const createdTags = getCreatedTags()
	const hash = 'Tag_' + tag.key
	if (createdTags.find((createdTag) => createdTag.key === tag.key)) return
	localStorage.setItem(hash, JSON.stringify(tag))
}

export const deleteTag = (tag: Tag) => {
	const hash = 'Tag_' + tag.key
	localStorage.removeItem(hash)
	getSavedDeckNames().forEach((deck) => {
		const savedDeck = getSavedDeck(deck)
		console.log(savedDeck)
		if (!savedDeck || !savedDeck.tags) return
		savedDeck.tags = savedDeck.tags.filter((deckTag) => deckTag !== tag.key)
		saveDeck(savedDeck)
	})
}

export function toSavedDeck(deck: EditedDeck): Deck {
	return {
		name: deck.name,
		code: Math.random.toString(),
		icon: deck.icon,
		tags: deck.tags ? deck.tags : [],
		cards: deck.cards.map((card) => CARDS[card.props.id]),
	}
}

export function toEditDeck(deck: Deck): EditedDeck {
	return {
		name: deck.name,
		icon: deck.icon as EditedDeck['icon'],
		tags: deck.tags ? deck.tags : [],
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
