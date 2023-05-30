import CARDS from '../../common/cards'
import {CONFIG, DEBUG_CONFIG, RANKS} from '../../config'

/**
 * @typedef {import('common/types/cards').RankT} RankT
 */
/**
 *
 * @param {string} cardId
 * @returns {RankT}
 */
export function getCardRank(cardId) {
	/** @type {RankT} */
	let rank = {name: 'stone', cost: 0}
	if (RANKS[cardId]) {
		rank.cost = RANKS[cardId]

		const rankKeys = Object.keys(RANKS.ranks)
		const rankValues = Object.values(RANKS.ranks)
		for (let i = 0; i < rankKeys.length; i++) {
			const key = rankKeys[i]
			const values = rankValues[i]
			if (values.includes(rank.cost)) rank.name = key
		}
	}
	return rank
}

/**
 * @param {CardInfoT} card
 */
export function getCardCost(card) {
	const rank = getCardRank(card.id)
	return rank.cost
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
