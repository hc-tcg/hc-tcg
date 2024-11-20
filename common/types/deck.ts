import {TypeT} from './cards'
import {LocalCardInstance} from './server-requests'

export type Tag = {
	name: string
	color: string
	key: string
}

type DeckIconItem = {
	iconType: 'item'
	icon: TypeT
}

type DeckIconHermit = {
	iconType: 'hermit'
	icon: string
}

export type Deck = {
	name: string
	code: string
	cards: Array<LocalCardInstance>
	tags: Array<Tag>
	public: boolean
} & (DeckIconItem | DeckIconHermit)

// This type is used to ensure saving and loading compatibility with older versions of hc-tcg
export type LegacyDeck = {
	name: string
	icon: TypeT
	cards: Array<{
		cardId: string
		cardInstance: string
	}>
	code?: string
	tags: Array<string> | null
}
