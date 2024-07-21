import {describe, test} from '@jest/globals'

import {CARDS_LIST} from '../../../common/cards'

describe('Test all cards have a unique ID', () => {
	test('Unique Numeric ID', () => {
		let ids = new Set()
		for (const card of CARDS_LIST) {
			if (ids.has(card.props.numericId)) {
				throw new Error(`Duplicate IDs found: ${card.props.numericId} (${card.props.name})`)
			}
			ids.add(card.props.numericId)
		}
	})
})
