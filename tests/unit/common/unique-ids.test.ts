import {describe, expect, test} from '@jest/globals'
import {ACHIEVEMENTS_LIST} from 'common/achievements'

import {CARDS_LIST} from 'common/cards'
import {STATUS_EFFECTS_LIST} from 'common/status-effects'

describe('Test unique IDs', () => {
	test('Test cards have unique IDs', () => {
		let cards: Array<string> = []
		let numericIds: Array<number> = []

		for (const card of CARDS_LIST) {
			expect(cards).not.toContain(card.id)
			cards.push(card.id)

			expect(numericIds).not.toContain(card.numericId)
			numericIds.push(card.numericId)
		}
	})
	test('Test status effects have unique IDs', () => {
		let effects: Array<string> = []

		for (const effect of STATUS_EFFECTS_LIST) {
			expect(effects).not.toContain(effect.id)
			effects.push(effect.id)
		}
	})
	test('Test achievements effects have unique IDs', () => {
		let achievements: Array<string> = []

		for (const achievement of ACHIEVEMENTS_LIST) {
			expect(achievements).not.toContain(achievement.id)
			achievements.push(achievement.id)
		}
	})
})
