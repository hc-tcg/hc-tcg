import {afterAll, beforeAll, describe, expect, test} from '@jest/globals'
import {CARDS_LIST} from 'common/cards'
import {config} from 'dotenv'
import {Database, setupDatabase} from 'server/db/db'

describe('Test Database', () => {
	let database: Database
	const BF_DEPTH = 4
	const playerDeck = {
		name: 'Testing deck',
		icon: 'balanced',
		cards: [1, 2, 2, 3, 4, 4, 5, 4],
		tags: [],
	}

	beforeAll(async () => {
		const env = config()
		database = setupDatabase(
			CARDS_LIST,
			{
				...{
					POSTGRES_DATABASE: 'hctcg',
					POSTGRES_USER: 'hctcg',
					POSTGRES_PASSWORD: 'hctcg',
					POSTGRES_HOST: 'localhost',
					POSTGRES_PORT: '5432',
				},
				...process.env,
				...env,
			},
			BF_DEPTH,
		)
		await database.pool.query(
			'BEGIN; DROP SCHEMA public CASCADE; CREATE SCHEMA public;',
		)
		return await database.new()
	})

	afterAll(async () => {
		await database.pool.query('ROLLBACK')
		await database.close()
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

	test('Authenticate', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		if (!user) throw new Error('Expected user to not be null')

		const authenticatedUser = await database.authenticateUser(
			user.uuid,
			user.secret,
		)
		const incorrectUser = await database.authenticateUser(
			user.uuid,
			'e3b4f689-1c0e-4f5f-bfd8-cfa5b0d0654a',
		)

		expect(authenticatedUser?.username).toBe(user.username)
		expect(authenticatedUser?.minecraftName).toBe(user.minecraftName)
		expect(authenticatedUser?.uuid).toBe(user.uuid)
		expect(incorrectUser).toBeNull()
	})

	test('Add deck', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')

		if (!user) throw new Error('Expected user to not be null')

		let code: string | null = null

		code = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			playerDeck.tags,
			user.uuid,
		)

		if (!code) throw new Error('Expected code to not be null')

		expect(typeof code === 'string').toBeTruthy()

		const returnedDeck = await database.getDeckFromID(code)
		expect(returnedDeck).not.toBeNull()

		expect(returnedDeck?.name).toBe('Testing deck')
		expect(returnedDeck?.icon).toBe('balanced')

		expect(
			returnedDeck?.cards.filter((card) => card.numericId === 1).length,
		).toEqual(1)
		expect(
			returnedDeck?.cards.filter((card) => card.numericId === 2).length,
		).toEqual(2)
		expect(
			returnedDeck?.cards.filter((card) => card.numericId === 3).length,
		).toEqual(1)
		expect(
			returnedDeck?.cards.filter((card) => card.numericId === 4).length,
		).toEqual(3)
		expect(
			returnedDeck?.cards.filter((card) => card.numericId === 5).length,
		).toEqual(1)
	})

	test('Add Game and check Stat Retrieval Works', async () => {
		const winner = await database.insertUser('Winner', 'ethoslab')
		const loser = await database.insertUser('Winner', 'geminitay')

		if (!winner || !loser) throw new Error('Expected users to not be null')

		const winnerDeckCode = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			playerDeck.tags,
			winner.uuid,
		)

		const loserDeckCode = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			playerDeck.tags,
			loser.uuid,
		)

		if (!winnerDeckCode || !loserDeckCode)
			throw new Error('Expected deck codes to not be null')

		await database.insertGame(
			winnerDeckCode,
			loserDeckCode,
			winner.uuid,
			loser.uuid,
			'player_won',
			winner.uuid,
		)

		await database.insertGame(
			winnerDeckCode,
			loserDeckCode,
			winner.uuid,
			loser.uuid,
			'forfeit',
			loser.uuid,
		)

		await database.insertGame(
			winnerDeckCode,
			loserDeckCode,
			winner.uuid,
			loser.uuid,
			'tie',
			null,
		)

		const winningPlayerStats = await database.getUserStats(winner.uuid)
		expect(winningPlayerStats?.wins).toBe(1)
		expect(winningPlayerStats?.losses).toBe(0)
		expect(winningPlayerStats?.forfeitWins).toBe(0)
		expect(winningPlayerStats?.forfeitLosses).toBe(1)
		expect(winningPlayerStats?.ties).toBe(1)
		expect(winningPlayerStats?.gamesPlayed).toBe(3)

		const losingPlayerStats = await database.getUserStats(loser.uuid)
		expect(losingPlayerStats?.wins).toBe(0)
		expect(losingPlayerStats?.losses).toBe(1)
		expect(losingPlayerStats?.forfeitWins).toBe(1)
		expect(losingPlayerStats?.forfeitLosses).toBe(0)
		expect(losingPlayerStats?.ties).toBe(1)
		expect(losingPlayerStats?.gamesPlayed).toBe(3)

		const winningDeckStats = await database.getDeckStats(winnerDeckCode)
		expect(winningDeckStats?.wins).toBe(1)
		expect(winningDeckStats?.losses).toBe(0)
		expect(winningDeckStats?.forfeitWins).toBe(0)
		expect(winningDeckStats?.forfeitLosses).toBe(1)
		expect(winningDeckStats?.ties).toBe(1)
		expect(winningDeckStats?.gamesPlayed).toBe(3)

		const losingDeckStats = await database.getDeckStats(loserDeckCode)
		expect(losingDeckStats?.wins).toBe(0)
		expect(losingDeckStats?.losses).toBe(1)
		expect(losingDeckStats?.forfeitWins).toBe(1)
		expect(losingDeckStats?.forfeitLosses).toBe(0)
		expect(losingDeckStats?.ties).toBe(1)
		expect(losingDeckStats?.gamesPlayed).toBe(3)
	})

	test('Update Username and Minecraft Name', async () => {
		const user = await database.insertUser('Ethoslab', 'ethoslab')
		if (!user) throw new Error('Expected user to not be null')

		await database.setUsername(user.uuid, 'GeminiTay')
		await database.setMinecraftName(user.uuid, 'geminitay')

		const updatedUser = await database.getUserInfo(user.uuid)

		expect(updatedUser?.username).toBe('GeminiTay')
		expect(updatedUser?.minecraftName).toBe('geminitay')
	})
})
