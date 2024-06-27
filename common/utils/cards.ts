import {CARDS} from '../cards'
import {CardCategoryT} from '../types/cards'
import {CardInstance} from '../types/game-state'
import {LocalCardInstance} from '../types/server-requests'

/**
 * Returns true if the two cards are equal
 */
export function equalCard(card1: LocalCardInstance | null, card2: LocalCardInstance | null) {
	if (!card1 && !card2) return true
	if (!card1 || !card2) return false
	return card1.props.id === card2.props.id && card1.instance === card2.instance
}

/**
 * Check if card is the type of card
 */
export function isCardInstanceType(card: LocalCardInstance | null, type: CardCategoryT): boolean {
	if (!card) return false
	return card.props.category == type
}
