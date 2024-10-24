import {CARDS} from '../cards'
import {LocalCardInstance, WithoutFunctions} from './server-requests'

export type Tag = {
	name: string
	color: string
	key: string
}

export type UnsavedDeck = {
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
	cards: Array<LocalCardInstance>
	tags: Array<string> | null
}

export type SavedDeckT = {
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
	tags: Array<string> | null
}

export function loadSavedDeck(deck: SavedDeckT | null): UnsavedDeck | null {
	if (!deck) return null

	let name = deck.name
	let icon = deck.icon

	let cards = deck.cards
		.map((card) => {
			let cardInfo = CARDS[card.cardId]
			if (!cardInfo) return null
			return {
				props: WithoutFunctions(cardInfo),
				entity: card.cardInstance,
			}
		})
		.filter((card) => card !== null) as Array<LocalCardInstance>

	let tags = deck.tags

	return {
		name,
		icon,
		cards,
		tags,
	}
}
