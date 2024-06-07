import {describe, expect, test} from '@jest/globals'

import {censorString} from '../../../common/utils/formatting'

describe('censorship tests', () => {
	test('simple censorship', () => {
		expect(censorString('')).toBe('')
		expect(censorString('fuck')).toBe('****')
		// Do not censor sub words, ie ass
		expect(censorString('pass')).toBe('pass')
		expect(censorString('assert')).toBe('assert')
		expect(censorString('hello pass assert hello')).toBe('hello pass assert hello')
	})
})
