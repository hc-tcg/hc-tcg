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

type DeckIconEffect = {
	iconType: 'effect'
	icon: string
}

export type Deck = {
	name: string
	code: string
	cards: Array<LocalCardInstance>
	tags: Array<Tag>
	public: boolean
} & (DeckIconItem | DeckIconHermit | DeckIconEffect)

export type ApiDeck = {
	name: string | null
	icon: string | null
	iconType: string | null
	code: string
	cards: Array<string>
	tags: Array<Tag>
}

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
