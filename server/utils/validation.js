import CARDS from '../cards'
import {CONFIG, DEBUG_CONFIG, RANKS} from '../../config'

/**
 *
 * @param {CardInfoT} card
 */
export function getCardRank(card) {
	let rank = 'stone'
	if (RANKS.iron.includes(card.id)) rank = 'iron'
	else if (RANKS.gold.includes(card.id)) rank = 'gold'
	else if (RANKS.diamond.includes(card.id)) rank = 'diamond'
	return rank
}

/**
 * @param {CardInfoT} card
 */
export function getCardCost(card) {
	const rank = getCardRank(card)

	switch (rank) {
		case 'stone':
			return 0
		case 'iron':
			return CONFIG.limits.ironCost
		case 'gold':
			return CONFIG.limits.goldCost
		case 'diamond':
			return CONFIG.limits.diamondCost

		default:
			throw new Error(`Invalid rank "${rank}" on card "${card.id}"`)
	}
}

/**
	@param {Array<string>} deckCards
*/
export function getTotalCost(deckCards) {
	let tokenCost = 0

	deckCards = deckCards.filter((cardId) => CARDS[cardId])

	deckCards.forEach((cardId) => {
		tokenCost += getCardCost(CARDS[cardId])
	})

	return tokenCost
}

/**
	@param {Array<string>} deckCards
*/
export function validateDeck(deckCards) {
	if (DEBUG_CONFIG.disableDeckValidation) return

	const limits = CONFIG.limits
	deckCards = deckCards.filter((cardId) => CARDS[cardId])

	// order validation by simplest problem first, so that a player can easily identify why their deck isn't valid

	// less than one hermit
	const hasHermit = deckCards.some((cardId) => CARDS[cardId].type === 'hermit')
	if (!hasHermit) return 'Deck must have at least one hermit.'

	// more than max duplicates
	const tooManyDuplicates =
		limits.maxDuplicates &&
		deckCards.some((cardId) => {
			if (CARDS[cardId].type === 'item') return false
			const duplicates = deckCards.filter(
				(filterCardId) => filterCardId === cardId
			)
			return duplicates.length > limits.maxDuplicates
		})

	if (tooManyDuplicates)
		return `You cannot have more than ${limits.maxDuplicates} duplicate cards unless they are item cards.`

	// more than max tokens
	const deckCost = getTotalCost(deckCards)
	if (deckCost > limits.maxDeckCost)
		return `Deck cannot cost more than ${limits.maxDeckCost} tokens.`

	const exactAmount = limits.minCards === limits.maxCards
	const exactAmountText = `Deck must have exactly ${limits.minCards} cards.`

	if (deckCards.length < limits.minCards)
		return exactAmount
			? exactAmountText
			: `Deck must have at least ${limits.minCards} cards.`
	if (deckCards.length > limits.maxCards)
		return exactAmount
			? exactAmountText
			: `Deck can not have more than ${limits.maxCards} cards.`
}
