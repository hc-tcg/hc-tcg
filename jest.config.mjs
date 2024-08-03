/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
	// Automatically clear mock calls, instances, contexts and results before every test
	clearMocks: true,

	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'ts', 'json'],

	roots: ['tests', '<rootDir>'],

  moduleNameMapper: {
    '^common/(.*)$': '<rootDir>/common/$1',
    '^server/(.*)$': '<rootDir>/server/src/$1',
  },

	// A map from regular expressions to paths to transformers
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: 'tests/tsconfig.json',
			},
		],
	},
}

export default config
