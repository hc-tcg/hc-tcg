import {LocalCardInstance} from './server-requests'

export type Tag = {
	name: string
	color: string
	key: string
}

export type Deck = {
	name: string
	icon: string
	code: string
	cards: Array<LocalCardInstance>
	tags: Array<Tag>
}

export type LegacyDeck = {
	name: string
	icon:
		| 'any'
		| 'balanced'
		| 'builder'
		| 'explorer'
		| 'farm'
		| 'miner'
		| 'prankster'
		| 'pvp'
		| 'redstone'
		| 'speedrunner'
		| 'terraform'
	// This type is used to ensure saving and loading compatibility with older versions of hc-tcg
	cards: Array<{
		cardId: string
		cardInstance: string
	}>
	code?: string
	tags: Array<string> | null
}
