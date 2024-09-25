import {afterAll, beforeAll, describe, expect, test} from '@jest/globals'
import {CARDS_LIST} from 'common/cards'
import {Databse, setupDatabase} from 'server/db/db'
import {config} from 'dotenv'

describe('Test Database', () => {
	let database: Databse

	beforeAll(async () => {
		const env = config()
		database = setupDatabase(CARDS_LIST, {
			...{
				POSTGRES_DATABASE: 'hctcg',
				POSTGRES_USER: 'hctcg',
				POSTGRES_PASSWORD: 'hctcg',
				POSTGRES_HOST: 'localhost',
			},
			...process.env,
			...env,
		})
		return database.new()
	})

	afterAll(async () => {
		database.close()
	})

	test('Add user', async () => {
		const user = await database.insertUser('Test User', "ethoslab")
		expect(user).not.toBeNull()
		expect(user?.username).toBe('Test User')
		expect(user?.minecraftName).toBe("ethoslab")
		expect(user?.uuid).toBeTruthy()
		expect(user?.secret).toBeTruthy()
		expect(typeof user?.uuid === 'string').toBeTruthy()
		expect(typeof user?.secret === 'string').toBeTruthy()
	})
})