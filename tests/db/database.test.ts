import {beforeAll, describe, expect, test} from '@jest/globals'
import {Pool} from 'pg'
import {setupDatabase} from 'server/db/db'
import QUERIES from 'server/db/queries'

describe('Test Database', () => {
	let database: any

	beforeAll(() => {
		database = setupDatabase()
	})

	test('test database queries', () => {
		for (const query of Object.values(QUERIES)) {
			database.validate(query)
		}
	})
})
