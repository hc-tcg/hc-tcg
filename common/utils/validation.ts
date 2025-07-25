import ImmortalityBed from '../cards/bed-update/attach/immortality-bed'
import {Card} from '../cards/types'
import {CONFIG} from '../config'
import {EXPANSIONS} from '../const/expansions'
import {getDeckCost} from './ranks'

type ValidateDeckResult =
	| {
			valid: true
	  }
	| {
			valid: false
			reason: String
	  }

export function validateDeck(deckCards: Array<Card>): ValidateDeckResult {
	if (CONFIG.game.disableDeckValidation) return {valid: true}

	const limits = CONFIG.game.limits

	// order validation by simplest problem first, so that a player can easily identify why their deck isn't valid

	// Contains disabled cards
	const hasDisabledCards = deckCards.some(
		(card) =>
			EXPANSIONS[card.expansion].disabled === true ||
			limits.bannedCards.includes(card.id) ||
			limits.disabledCards.includes(card.id),
	)
	if (hasDisabledCards)
		return {valid: false, reason: 'Deck must not include removed cards.'}

	// less than one hermit
	const hasHermit = deckCards.some((card) => card.category === 'hermit')
	if (!hasHermit)
		return {valid: false, reason: 'Deck must have at least one Hermit.'}

	// Immortality Bed, or similar cards
	const mythicDuplicates = deckCards.some(() => {
		const mythics = [ImmortalityBed]
		for (let i = 0; i < mythics.length; i++) {
			let count = deckCards.filter(
				(filterCard) => filterCard.numericId === mythics[i].numericId,
			).length
			if (count > 1) {
				return mythics[i].name
			}
		}
		return false
	})

	if (mythicDuplicates) {
		return {
			valid: false,
			reason: `You cannot have more than one copy of ${mythicDuplicates}.`, //@TODO Still have to make this return the name instead of true.
		}
	}

	// more than max duplicates
	const tooManyDuplicates =
		limits.maxDuplicates &&
		deckCards.some((card) => {
			if (card.category === 'item') return false
			const duplicates = deckCards.filter(
				(filterCard) => filterCard.numericId === card.numericId,
			)
			return duplicates.length > limits.maxDuplicates
		})

	if (tooManyDuplicates)
		return {
			valid: false,
			reason: `You cannot have more than ${limits.maxDuplicates} duplicate cards unless they are item cards.`,
		}

	// more than max tokens
	const deckCost = getDeckCost(deckCards)
	if (deckCost > limits.maxDeckCost)
		return {
			valid: false,
			reason: `Deck cannot cost more than ${limits.maxDeckCost} tokens.`,
		}

	const exactAmount = limits.minCards === limits.maxCards
	const exactAmountText = `Deck must have exactly ${limits.minCards} cards.`

	if (deckCards.length < limits.minCards)
		return {
			valid: false,
			reason: exactAmount
				? exactAmountText
				: `Deck must have at least ${limits.minCards} cards.`,
		}
	if (deckCards.length > limits.maxCards)
		return {
			valid: false,
			reason: exactAmount
				? exactAmountText
				: `Deck can not have more than ${limits.maxCards} cards.`,
		}

	return {valid: true}
}
