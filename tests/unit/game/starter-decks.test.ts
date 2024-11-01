import {describe, expect, test} from '@jest/globals'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import {validateDeck} from 'common/utils/validation'

describe('Test starter decks', () => {
	test('Test starter decks are valid.', () => {
		for (const deck of STARTER_DECKS) {
			expect(validateDeck(deck)).toHaveProperty('valid', true)
		}
	})
})
