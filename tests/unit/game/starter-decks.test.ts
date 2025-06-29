import assert from 'assert'
import {describe, test} from '@jest/globals'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import {getDeckCost} from 'common/utils/ranks'
import {validateDeck} from 'common/utils/validation'

describe('Test starter decks', () => {
	test('Verify starter decks are valid.', async () => {
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
})
