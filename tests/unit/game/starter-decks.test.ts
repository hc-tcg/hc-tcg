import assert from 'assert'
import {describe, test} from '@jest/globals'
import PharaohRare from 'common/cards/advent-of-tcg/hermits/pharaoh-rare'
import {PHARAOH_BOSS_DECKS} from 'common/cards/pharaoh-boss-decks'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import {getDeckCost} from 'common/utils/ranks'
import {validateDeck} from 'common/utils/validation'

describe('Test starter decks', () => {
	test('Verify starter decks are valid.', () => {
		for (const deck of STARTER_DECKS) {
			const validation = validateDeck(deck.cards)
			assert(
				validation.valid === true,
				`The deck "${deck.name}" is not valid. Reason: ${validation.valid === false && validation.reason} `,
			)
			assert(
				getDeckCost(deck.cards) === 42,
				`The deck "${deck.name}" does not cost 42 tokens. Current token count: ${getDeckCost(deck.cards)}`,
			)
		}
	})
	test('Verify Pharaoh decks meet custom parameters', () => {
		for (const deck of PHARAOH_BOSS_DECKS) {
			assert(
				deck.cards.length === 42,
				`The deck "${deck.name}" does not contain exactly 42 cards. Current card count: ${deck.cards.length}`,
			)
			assert(
				deck.cards.includes(PharaohRare),
				`The deck "${deck.name}" does not contain a copy of PharaohRare.`,
			)
		}
	})
})
