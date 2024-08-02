import {CardCategoryT} from '../types/cards'
import {LocalCardInstance} from '../types/server-requests'

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
