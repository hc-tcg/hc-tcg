import {type Card, isHermit, isItem} from '../cards/types'
import type {CardEntity} from '../entities'
import type {CardCategoryT} from '../types/cards'
import type {
	LocalCardInstance,
	WithoutFunctions,
} from '../types/server-requests'

/**
 * Returns true if the two cards are equal
 */
export function equalCard(
	card1: LocalCardInstance | null,
	card2: LocalCardInstance | null,
) {
	return card1?.entity === card2?.entity
}

/**
 * Check if card is the type of card
 */
export function isCardInstanceType(
	card: LocalCardInstance | null,
	type: CardCategoryT,
): boolean {
	if (!card) return false
	return card.props.category == type
}

/**Converts a Card to a local card instance */
export function toLocalCardInstance(card: Card): LocalCardInstance {
	return {
		props: card as WithoutFunctions<Card>,
		entity: Math.random().toString() as CardEntity,
		slot: null,
		attackHint: null,
		turnedOver: false,
		prizeCard: false,
	}
}

const TYPE_ORDER = {
	hermit: 0,
	attach: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

// We want to fix UR with Rare to place all cards with abilities in the proper order.
const RARITY_ORDER = {
	common: 0,
	rare: 1,
	ultra_rare: 1,
}

function orderCardProps(a: Card, b: Card) {
	return (
		[
			TYPE_ORDER[a.category] - TYPE_ORDER[b.category],
			isHermit(a) && isHermit(b) && a.type.localeCompare(b.type),
			isItem(a) && isItem(b) && a.name.localeCompare(b.name),
			isHermit(a) &&
				isHermit(b) &&
				RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity],
			a.tokens !== 'wild' && b.tokens !== 'wild' && a.tokens - b.tokens,
			isHermit(a) &&
				isHermit(b) &&
				a.secondary.cost.length - b.secondary.cost.length,
			isHermit(a) && isHermit(b) && a.secondary.damage - b.secondary.damage,
			isHermit(a) &&
				isHermit(b) &&
				a.primary.cost.length - b.primary.cost.length,
			isHermit(a) && isHermit(b) && a.primary.damage - b.primary.damage,
			isHermit(a) && isHermit(b) && a.health - b.health,
			a.name.localeCompare(b.name),
		].find(Boolean) || 0
	)
}

export function sortCards(cards: Array<Card>) {
	return cards.slice().sort(orderCardProps)
}

export function sortCardInstances(
	cards: Array<LocalCardInstance>,
): Array<LocalCardInstance> {
	return cards.slice().sort((a, b) => orderCardProps(a.props, b.props))
}
