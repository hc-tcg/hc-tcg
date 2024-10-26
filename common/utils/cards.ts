import {Card} from '../cards/base/types'
import {CardEntity} from '../entities'
import {CardCategoryT} from '../types/cards'
import {LocalCardInstance, WithoutFunctions} from '../types/server-requests'

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
		props: WithoutFunctions(card),
		entity: Math.random().toString() as CardEntity,
		slot: null,
		attackHint: null,
		turnedOver: false,
	}
}
