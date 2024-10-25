import {afterAll, beforeAll, describe, expect, test} from '@jest/globals'
import assert from 'assert'
import {CARDS_LIST} from 'common/cards'
import {config} from 'dotenv'
import {Database, setupDatabase} from 'server/db/db'
import {generateDatabaseCode} from 'common/utils/database-codes'

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
			'BEGIN TRANSACTION; DROP SCHEMA public CASCADE; CREATE SCHEMA public;',
		)
		return await database.new()
	})

	afterAll(async () => {
		await database.pool.query('ROLLBACK')
		await database.close()
	})

	test('Add User', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')
		expect(user.body).not.toBeNull()
		expect(user.body.username).toBe('Test User')
		expect(user.body.minecraftName).toBe('ethoslab')
		expect(user.body.uuid).toBeTruthy()
		expect(user.body.secret).toBeTruthy()
		expect(typeof user.body.uuid === 'string').toBeTruthy()
		expect(typeof user.body.secret === 'string').toBeTruthy()
	})

	test('Authenticate', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		const authenticatedUser = await database.authenticateUser(
			user.body.uuid,
			user.body.secret,
		)
		const incorrectUser = await database.authenticateUser(
			user.body.uuid,
			'e3b4f689-1c0e-4f5f-bfd8-cfa5b0d0654a',
		)

		assert(
			authenticatedUser.type === 'success',
			'The user should be created successfully',
		)

		expect(authenticatedUser.body.username).toBe(user.body.username)
		expect(authenticatedUser.body.minecraftName).toBe(user.body.minecraftName)
		expect(authenticatedUser.body.uuid).toBe(user.body.uuid)
		expect(incorrectUser.type).toBe('failure')
	})

	test('Add and Retrieve Deck', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		const tag = await database.insertTag(
			user.body.uuid,
			'Test Tag',
			'#FF0000',
			generateDatabaseCode(),
		)
		assert(tag.type === 'success', 'The tag should be created successfully')

		const code = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			[tag.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)
		assert(code.type === 'success', 'The deck should be created successfully')

		const returnedDeck = await database.getDeckFromID(code.body)

		assert(
			returnedDeck.type === 'success',
			'The deck should be retrieved successfully',
		)

		expect(returnedDeck.body.name).toBe('Testing deck')
		expect(returnedDeck.body.icon).toBe('balanced')
		expect(returnedDeck.body.tags).toStrictEqual([tag.body])

		expect(
			returnedDeck.body.cards.filter((card) => card.numericId === 1).length,
		).toEqual(1)
		expect(
			returnedDeck.body.cards.filter((card) => card.numericId === 2).length,
		).toEqual(2)
		expect(
			returnedDeck.body.cards.filter((card) => card.numericId === 3).length,
		).toEqual(1)
		expect(
			returnedDeck.body.cards.filter((card) => card.numericId === 4).length,
		).toEqual(3)
		expect(
			returnedDeck.body.cards.filter((card) => card.numericId === 5).length,
		).toEqual(1)
	})

	test('Add Game and Check Stat Retrieval Works', async () => {
		const winner = await database.insertUser('Winner', 'ethoslab')
		const loser = await database.insertUser('Winner', 'geminitay')

		assert(
			winner.type === 'success',
			'The winner should be created successfully',
		)
		assert(loser.type === 'success', 'The loser should be created successfully')

		const winnerDeckCode = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			playerDeck.tags,
			generateDatabaseCode(),
			winner.body.uuid,
		)

		const loserDeckCode = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			playerDeck.tags,
			generateDatabaseCode(),
			loser.body.uuid,
		)

		assert(
			winnerDeckCode.type === 'success',
			'The deck should be created successfully',
		)
		assert(
			loserDeckCode.type === 'success',
			'The deck should be created successfully',
		)

		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			'player_won',
			35000000,
			winner.body.uuid,
			'123456789ABCDEF',
			Buffer.from([0x00, 0x0a, 0x00, 0x04, 0x00]),
		)

		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			'forfeit',
			35000000,
			loser.body.uuid,
			'123456789ABCDEF',
			Buffer.from([0x00, 0x0a, 0x00, 0x04, 0x00]),
		)

		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			'tie',
			35000000,
			null,
			'123456789ABCDEF',
			Buffer.from([0x00, 0x0a, 0x00, 0x04, 0x00]),
		)

		const winningPlayerStats = await database.getUserStats(winner.body.uuid)
		assert(
			winningPlayerStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(winningPlayerStats.body.wins).toBe(1)
		expect(winningPlayerStats.body.losses).toBe(0)
		expect(winningPlayerStats.body.forfeitWins).toBe(0)
		expect(winningPlayerStats.body.forfeitLosses).toBe(1)
		expect(winningPlayerStats.body.ties).toBe(1)
		expect(winningPlayerStats.body.gamesPlayed).toBe(3)

		const losingPlayerStats = await database.getUserStats(loser.body.uuid)
		assert(
			losingPlayerStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(losingPlayerStats.body.wins).toBe(0)
		expect(losingPlayerStats.body.losses).toBe(1)
		expect(losingPlayerStats.body.forfeitWins).toBe(1)
		expect(losingPlayerStats.body.forfeitLosses).toBe(0)
		expect(losingPlayerStats.body.ties).toBe(1)
		expect(losingPlayerStats.body.gamesPlayed).toBe(3)

		const winningDeckStats = await database.getDeckStats(winnerDeckCode.body)
		assert(
			winningDeckStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(winningDeckStats.body.wins).toBe(1)
		expect(winningDeckStats.body.losses).toBe(0)
		expect(winningDeckStats.body.forfeitWins).toBe(0)
		expect(winningDeckStats.body.forfeitLosses).toBe(1)
		expect(winningDeckStats.body.ties).toBe(1)
		expect(winningDeckStats.body.gamesPlayed).toBe(3)

		const losingDeckStats = await database.getDeckStats(loserDeckCode.body)
		assert(
			losingDeckStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(losingDeckStats.body.wins).toBe(0)
		expect(losingDeckStats.body.losses).toBe(1)
		expect(losingDeckStats.body.forfeitWins).toBe(1)
		expect(losingDeckStats.body.forfeitLosses).toBe(0)
		expect(losingDeckStats.body.ties).toBe(1)
		expect(losingDeckStats.body.gamesPlayed).toBe(3)
	})

	test('Update Username and Minecraft Name', async () => {
		const user = await database.insertUser('Ethoslab', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		await database.setUsername(user.body.uuid, 'GeminiTay')
		await database.setMinecraftName(user.body.uuid, 'geminitay')

		const updatedUser = await database.getUserInfo(user.body.uuid)
		assert(
			updatedUser.type === 'success',
			'The updated user should be retrieved successfully',
		)

		expect(updatedUser.body.username).toBe('GeminiTay')
		expect(updatedUser.body.minecraftName).toBe('geminitay')
	})

	test('Add and Retrieve Tags', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		const tag1 = await database.insertTag(
			user.body.uuid,
			'Test Tag 1',
			'#FF0000',
			generateDatabaseCode(),
		)
		const tag2 = await database.insertTag(
			user.body.uuid,
			'Test Tag 2',
			'#FF0000',
			generateDatabaseCode(),
		)
		const tag3 = await database.insertTag(
			user.body.uuid,
			'Test Tag 3',
			'#FF0000',
			generateDatabaseCode(),
		)

		assert(tag1.type === 'success', 'Tag 1 was created successfully')
		assert(tag2.type === 'success', 'Tag 2 was created successfully')
		assert(tag3.type === 'success', 'Tag 3 was created successfully')

		const allTags = await database.getTags(user.body.uuid)

		assert(allTags.type === 'success', 'Tags were retrieved successfully')

		expect(allTags.body).toContainEqual(tag1.body)
		expect(allTags.body).toContainEqual(tag2.body)
		expect(allTags.body).toContainEqual(tag3.body)
	})

	test('Retrieve Decks', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		const tag1 = await database.insertTag(
			user.body.uuid,
			'Test Tag 1',
			'#FF0000',
			generateDatabaseCode(),
		)
		const tag2 = await database.insertTag(
			user.body.uuid,
			'Test Tag 2',
			'#FF0000',
			generateDatabaseCode(),
		)
		const tag3 = await database.insertTag(
			user.body.uuid,
			'Test Tag 3',
			'#FF0000',
			generateDatabaseCode(),
		)

		assert(tag1.type === 'success', 'Tag 1 was created successfully')
		assert(tag2.type === 'success', 'Tag 2 was created successfully')
		assert(tag3.type === 'success', 'Tag 3 was created successfully')

		const deck1 = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			[1, 2, 2, 3, 4, 4, 4, 5],
			[tag1.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)

		const deck2 = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.cards,
			[tag2.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)

		const deck3 = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			[71, 32, 63, 5],
			playerDeck.tags,
			generateDatabaseCode(),
			user.body.uuid,
		)

		assert(deck1.type === 'success', 'Deck 1 was created successfully')
		assert(deck2.type === 'success', 'Deck 2 was created successfully')
		assert(deck3.type === 'success', 'Deck 3 was created successfully')

		const allDecks = await database.getDecks(user.body.uuid)

		assert(
			allDecks.type === 'success',
			'The decks should be retrieved successfully',
		)

		const returnedDeck1 = allDecks.body.find((deck) => deck.code === deck1.body)
		const returnedDeck2 = allDecks.body.find((deck) => deck.code === deck2.body)
		const returnedDeck3 = allDecks.body.find((deck) => deck.code === deck3.body)

		expect(returnedDeck1).toBeTruthy()
		expect(returnedDeck2).toBeTruthy()
		expect(returnedDeck3).toBeTruthy()

		expect(returnedDeck1?.tags).toStrictEqual([tag1.body])
		expect(returnedDeck2?.tags).toStrictEqual([tag2.body])

		const firstDeckNumericIds = allDecks.body
			.find((deck) => deck.code === deck1.body)
			?.cards.map((card) => card.numericId)

		const thirdDeckNumericIds = allDecks.body
			.find((deck) => deck.code === deck3.body)
			?.cards.map((card) => card.numericId)

		expect(firstDeckNumericIds).toStrictEqual([1, 2, 2, 3, 4, 4, 4, 5])
		expect(thirdDeckNumericIds).toStrictEqual([71, 32, 63, 5])
	})
})
