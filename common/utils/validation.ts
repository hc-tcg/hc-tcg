import {CONFIG, DEBUG_CONFIG, EXPANSIONS, PERMIT_RANKS} from '../config'
import {CARDS} from '../cards'
import {getDeckCost} from './ranks'

export function validateDeck(deckCards: Array<string>, obtainedPermits: Array<string>) {
	if (DEBUG_CONFIG.disableDeckValidation) return

	const limits = CONFIG.limits
	deckCards = deckCards.filter((cardId) => CARDS[cardId])

	// order validation by simplest problem first, so that a player can easily identify why their deck isn't valid

	// Contains disabled cards
	const hasDisabledCards = deckCards.some((cardId) =>
		EXPANSIONS.disabled.includes(CARDS[cardId].getExpansion())
	)
	if (hasDisabledCards) return 'Deck must not include removed cards.'

	const hasNoPermit = !deckCards.every(
		(cardId) =>
			obtainedPermits.includes(cardId) ||
			PERMIT_RANKS.free.includes(cardId) ||
			CARDS[cardId].type === 'item'
	)
	if (hasNoPermit) return 'Deck may only include cards you have a permit for.'

	// less than one hermit
	const hasHermit = deckCards.some((cardId) => CARDS[cardId].type === 'hermit')
	if (!hasHermit) return 'Deck must have at least one Hermit.'

	// Diamond permit duplicates
	const diamondPermitDuplicates = deckCards.some((cardId) => {
		const duplicates = deckCards.filter(
			(filterCardId) => PERMIT_RANKS.diamond.includes(filterCardId) && filterCardId === cardId
		)
		return duplicates.length > 1
	})

	if (diamondPermitDuplicates)
		return `You cannot have more than 1 copy of each diamond permit card.`

	// more than max duplicates
	const tooManyDuplicates =
		limits.maxDuplicates &&
		deckCards.some((cardId) => {
			if (CARDS[cardId].type === 'item' && CARDS[cardId].rarity === 'common') return false
			const duplicates = deckCards.filter((filterCardId) => filterCardId === cardId)
			return duplicates.length > limits.maxDuplicates
		})

	if (tooManyDuplicates)
		return `You cannot have more than ${limits.maxDuplicates} duplicate cards unless they are single item cards.`

	// more than max tokens
	const deckCost = getDeckCost(deckCards)
	if (deckCost > limits.maxDeckCost)
		return `Deck cannot cost more than ${limits.maxDeckCost} tokens.`

	const exactAmount = limits.minCards === limits.maxCards
	const exactAmountText = `Deck must have exactly ${limits.minCards} cards.`

	if (deckCards.length < limits.minCards)
		return exactAmount ? exactAmountText : `Deck must have at least ${limits.minCards} cards.`
	if (deckCards.length > limits.maxCards)
		return exactAmount ? exactAmountText : `Deck can not have more than ${limits.maxCards} cards.`
}
