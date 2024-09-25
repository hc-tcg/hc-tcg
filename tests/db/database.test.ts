import {beforeAll, describe, test} from '@jest/globals'
import {CARDS_LIST} from 'common/cards'
import {Databse, setupDatabase} from 'server/db/db'

describe('Test Database', () => {
	let database: Databse

	beforeAll(async () => {
		database = setupDatabase(CARDS_LIST, {
			DATABASE: 'hctcg',
			USER: 'hctcg',
			PASSWORD: 'hctcg',
			HOST: 'localhost',
		})
		return database.new()
	})

	test('Add user', async () => {
		database.insertUser('Test User', null)
	})
})
