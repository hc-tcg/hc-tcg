/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
	// Automatically clear mock calls, instances, contexts and results before every test
	clearMocks: true,

	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'ts', 'json'],

	roots: ['tests/unit/', 'tests/db'],

	moduleNameMapper: {
		'^client/(.*)$': '<rootDir>/client/src/$1',
		// Deal with weird imports in the client.
		'^components/(.*)$': '<rootDir>/client/src/components/$1',
		'^logic/(.*)$': '<rootDir>/client/src/logic/$1',
		'^common/(.*)$': '<rootDir>/common/$1',
		'^server/(.*)$': '<rootDir>/server/src/$1',
		'^.+\\.css$': ['jest-scss-transform', {modules: true}],
		'^.+\\.scss$': ['jest-scss-transform', {modules: true}],
	},

	// A map from regular expressions to paths to transformers
	transform: {
		'^.+\\.[jt]sx?$': [
			'ts-jest',
			{
				diagnostics: false,
				tsconfig: 'tests/unit/tsconfig.json',
			},
		],
	},
}

export default config
