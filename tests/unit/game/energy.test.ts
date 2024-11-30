import {describe, expect, test} from '@jest/globals'
import {getRemainingEnergy, hasEnoughEnergy} from 'common/utils/attacks'

describe('Test Has Enough Energy', () => {
	test('Test Has Enough Energy', () => {
		expect(hasEnoughEnergy([], [], false)).toBeTruthy()
		expect(hasEnoughEnergy(['any'], ['balanced'], false)).toBeTruthy()
		expect(
			hasEnoughEnergy(['any', 'any'], ['balanced', 'any'], false),
		).toBeTruthy()
		expect(
			hasEnoughEnergy(['balanced', 'any'], ['balanced', 'any'], false),
		).toBeTruthy()
		expect(
			hasEnoughEnergy(
				['balanced', 'balanced', 'balanced'],
				['balanced', 'any'],
				false,
			),
		).toBeTruthy()

		expect(hasEnoughEnergy([], ['balanced'], false)).toBeFalsy()
		expect(hasEnoughEnergy([], ['any'], false)).toBeFalsy()
		expect(hasEnoughEnergy(['any'], ['balanced', 'any'], false)).toBeFalsy()
		expect(
			hasEnoughEnergy(
				['balanced', 'any'],
				['balanced', 'balanced', 'any'],
				false,
			),
		).toBeFalsy()
	})

	test('Test Get Remaining Energy is Optimal', () => {
		expect(getRemainingEnergy([], [])).toStrictEqual([])
		expect(getRemainingEnergy([], ['any'])).toBe('not-enough-energy')
		expect(getRemainingEnergy(['any'], [])).toStrictEqual(['any'])
		expect(getRemainingEnergy(['any', 'pvp'], ['pvp'])).toStrictEqual(['any'])
		expect(getRemainingEnergy(['any', 'pvp'], ['pvp', 'pvp'])).toStrictEqual([])
		expect(
			getRemainingEnergy(['any', 'pvp', 'any'], ['pvp', 'any']),
		).toStrictEqual(['any'])
		expect(
			getRemainingEnergy(['any', 'pvp', 'any'], ['pvp', 'pvp', 'pvp']),
		).toStrictEqual([])
		expect(
			getRemainingEnergy(['any', 'balanced', 'any'], ['pvp', 'pvp']),
		).toStrictEqual(['balanced'])
	})
})
