import {describe, expect, test, beforeAll} from '@jest/globals'
import {setupDatabase} from '../../server/src/db/db'
import {Pool} from 'pg'
import QUERIES from '../../server/src/db/queries'

describe('Test Database', () => {
	let database: null | Pool = null

	beforeAll(() => {
		database = setupDatabase()
	})

	test('test database queries', () => {
		expect(database).toBeTruthy()
		for (const query of Object.values(QUERIES)) {
			console.log(query)
		}
	})
})
