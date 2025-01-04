import assert from 'assert'
import {describe, test} from '@jest/globals'
import {STARTER_DECKS} from 'common/cards/starter-decks'
import {validateDeck} from 'common/utils/validation'

describe('Test starter decks', () => {
	test('Verify starter decks are valid.', () => {
		for (const deck of STARTER_DECKS) {
			assert(
				validateDeck(deck.cards).valid === true,
				`The deck "${deck.name}" is not valid`,
			)
		}
	})
})
