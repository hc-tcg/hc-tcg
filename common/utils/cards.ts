import {CARDS} from '../cards'
import {CardCategoryT} from '../types/cards'
import {CardInstance} from '../types/game-state'

/**
 * Returns true if the two cards are equal
 */
export function equalCard(card1: CardInstance | null, card2: CardInstance | null) {
	if (!card1 && !card2) return true
	if (!card1 || !card2) return false
	return card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
}

/**
 * Check if card is the type of card
 */
export function isCardInstanceype(card: CardInstance | null, type: CardCategoryT): boolean {
	if (!card) return false
	const cardInfo = CARDS[card.cardId]
	return cardInfo.props.category === type
}

export function getCardExpansion(cardId: string) {
	let expansion: string = CARDS[cardId].getExpansion()

	return expansion
}
