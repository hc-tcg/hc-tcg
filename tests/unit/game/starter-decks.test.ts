import {describe, expect, test} from '@jest/globals'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import {validateDeck} from 'common/utils/validation'

describe('Test starter decks', () => {
	test('Verify starter decks are valid.', () => {
		for (const deck of STARTER_DECKS) {
			expect(validateDeck(deck)).toStrictEqual({valid: true})
		}
	})
})
