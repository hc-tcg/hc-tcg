import {describe, expect, test} from '@jest/globals'

import {CARDS_LIST} from 'common/cards'
import {STATUS_EFFECTS_LIST} from 'common/status-effects'

describe('Test unique IDs', () => {
	test('Test cards have unique IDs', () => {
		let cards: Array<string> = []

		for (const card of CARDS_LIST) {
			expect(cards).not.toContain(card.id)
			cards.push(card.id)
		}
	})
	test('Test status effects have unique IDs', () => {
		let effects: Array<string> = []

		for (const effect of STATUS_EFFECTS_LIST) {
			expect(effects).not.toContain(effect.id)
			effects.push(effect.id)
		}
	})
})
