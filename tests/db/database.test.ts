import {afterAll, beforeAll, describe, expect, test} from '@jest/globals'
import {CARDS_LIST} from 'common/cards'
import {config} from 'dotenv'
import {Databse, setupDatabase} from 'server/db/db'

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
				POSTGRES_PORT: '5432',
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
		const user = await database.insertUser('Test User', 'ethoslab')
		expect(user).not.toBeNull()
		expect(user?.username).toBe('Test User')
		expect(user?.minecraftName).toBe('ethoslab')
		expect(user?.uuid).toBeTruthy()
		expect(user?.secret).toBeTruthy()
		expect(typeof user?.uuid === 'string').toBeTruthy()
		expect(typeof user?.secret === 'string').toBeTruthy()
	})

	test('Add deck', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		if (!user) return
		const playerDeck = {
			name: 'Testing deck',
			icon: 'balanced',
			cards: [1, 2, 3, 4, 4, 4, 5],
			tags: [],
		}
		const code = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			playerDeck.tags,
			user.uuid,
			user.secret,
		)
		expect(code).not.toBeNull()
		expect(typeof code === 'string').toBeTruthy()
	})
})
