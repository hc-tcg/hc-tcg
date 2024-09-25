import {beforeAll, describe, test, expect} from '@jest/globals'
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
		const user = await database.insertUser('Test User', null)
		expect(user).not.toBeNull()
		expect(user?.username).toBe('Test User')
		expect(user?.minecraftName).toBe(null)
		expect(user?.uuid).toBeTruthy()
		expect(user?.secret).toBeTruthy()
		expect(typeof user?.uuid === 'string').toBeTruthy()
		expect(typeof user?.secret === 'string').toBeTruthy()
	})
})
