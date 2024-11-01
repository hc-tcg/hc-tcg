import {describe, expect, test} from '@jest/globals'
import {validateDeck} from 'common/utils/validation'
import {STARTER_DECKS} from 'common/cards/starter-decks'

describe('Test starter decks', () => {
	test('Test starter decks are valid.', () => {
		for (const deck of STARTER_DECKS) {
			expect(validateDeck(deck)).toBe(true)
		}
	})
})
