import {beforeAll, describe, test} from '@jest/globals'
import {setupDatabase} from 'server/db/db'

describe('Test Database', () => {
	let database: any

	beforeAll(() => {
		database = setupDatabase()
	})

})
