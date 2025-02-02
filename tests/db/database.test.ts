import assert from 'assert'
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals'
import {CARDS, CARDS_LIST} from 'common/cards'
import BdoubleO100Common from 'common/cards/hermits/bdoubleo100-common'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderDoubleItem from 'common/cards/items/builder-rare'
import Fortune from 'common/cards/single-use/fortune'
import {PlayerEntity} from 'common/entities'
import {generateDatabaseCode} from 'common/utils/database-codes'
import {config} from 'dotenv'
import {Database} from 'server/db/db'

describe('Test Database', () => {
	let database: Database
	const BF_DEPTH = 4
	const playerDeck = {
		name: 'Testing deck',
		icon: 'balanced',
		iconType: 'item',
		cards: [
			BdoubleO100Common.numericId,
			EthosLabCommon.numericId,
			BalancedItem.numericId,
			BuilderDoubleItem.numericId,
			BuilderDoubleItem.numericId,
			Fortune.numericId,
		],
		tags: [],
	}

	beforeAll(async () => {
		const env = config()
		database = new Database(
			{
				...process.env,
				...env,
			},
			CARDS_LIST,
			BF_DEPTH,
		)
	})

	afterAll(async () => {
		await database.close()
	})

	beforeEach(async () => {
		await database.pool.query(
			'BEGIN TRANSACTION; DROP SCHEMA public CASCADE; CREATE SCHEMA public;',
		)
		return await database.new()
	})

	afterEach(async () => {
		await database.pool.query('ROLLBACK')
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
			playerDeck.iconType,
			playerDeck.cards,
			[tag.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)
		assert(code.type === 'success', 'The deck should be created successfully')
		const showData = await database.setShowData(true, code.body, user.body.uuid)

		assert(
			showData.type === 'success',
			'The deck should properly be marked as visible',
		)

		const returnedDeck = await database.getDeckFromID(code.body)

		assert(
			returnedDeck.type === 'success',
			'The deck should be retrieved successfully',
		)

		expect(returnedDeck.body.name).toBe('Testing deck')
		expect(returnedDeck.body.icon).toBe('balanced')
		expect(returnedDeck.body.iconType).toBe('item')
		expect(returnedDeck.body.tags).toStrictEqual([tag.body])

		expect(
			returnedDeck.body.cards.map((c) => CARDS[c].numericId),
		).toStrictEqual(playerDeck.cards)
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
			playerDeck.iconType,
			playerDeck.cards,
			playerDeck.tags,
			generateDatabaseCode(),
			winner.body.uuid,
		)

		const loserDeckCode = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.iconType,
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

		// The buffer can be ignored for now. It will store replays in the future, but the data doesn't matter
		// right now as replays aren't implemented yet
		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			{
				type: 'player-won',
				victoryReason: 'lives',
				winner: "Doesn't Matter" as PlayerEntity,
			},
			35000000,
			winner.body.uuid,
			'123456789ABCDEF',
			5,
			Buffer.from([0x00]),
			null,
		)

		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			{
				type: 'player-won',
				victoryReason: 'no-hermits-on-board',
				winner: "Doesn't Matter" as PlayerEntity,
			},
			35000000,
			winner.body.uuid,
			'123456789ABCDEF',
			5,
			Buffer.from([0x00]),
			null,
		)

		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			{
				type: 'player-won',
				victoryReason: 'timeout-without-hermits',
				winner: "Doesn't Matter" as PlayerEntity,
			},
			35000000,
			loser.body.uuid,
			'123456789ABCDEF',
			5,
			Buffer.from([0x00]),
			null,
		)

		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			{
				type: 'player-won',
				victoryReason: 'forfeit',
				winner: "Doesn't Matter" as PlayerEntity,
			},
			35000000,
			loser.body.uuid,
			'123456789ABCDEF',
			5,
			Buffer.from([0x00]),
			null,
		)

		await database.insertGame(
			winnerDeckCode.body,
			loserDeckCode.body,
			winner.body.uuid,
			loser.body.uuid,
			{type: 'tie'},
			35000000,
			null,
			'123456789ABCDEF',
			5,
			Buffer.from([0x00]),
			null,
		)

		const winningPlayerStats = await database.getUserStats(winner.body.uuid)
		assert(
			winningPlayerStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(winningPlayerStats.body.wins).toBe(2)
		expect(winningPlayerStats.body.losses).toBe(1)
		expect(winningPlayerStats.body.forfeitWins).toBe(0)
		expect(winningPlayerStats.body.forfeitLosses).toBe(1)
		expect(winningPlayerStats.body.ties).toBe(1)
		expect(winningPlayerStats.body.gamesPlayed).toBe(5)

		const losingPlayerStats = await database.getUserStats(loser.body.uuid)
		assert(
			losingPlayerStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(losingPlayerStats.body.wins).toBe(1)
		expect(losingPlayerStats.body.losses).toBe(2)
		expect(losingPlayerStats.body.forfeitWins).toBe(1)
		expect(losingPlayerStats.body.forfeitLosses).toBe(0)
		expect(losingPlayerStats.body.ties).toBe(1)
		expect(losingPlayerStats.body.gamesPlayed).toBe(5)

		const winningDeckStats = await database.getDeckStats(winnerDeckCode.body)
		assert(
			winningDeckStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(winningDeckStats.body.wins).toBe(2)
		expect(winningDeckStats.body.losses).toBe(1)
		expect(winningDeckStats.body.forfeitWins).toBe(0)
		expect(winningDeckStats.body.forfeitLosses).toBe(1)
		expect(winningDeckStats.body.ties).toBe(1)
		expect(winningDeckStats.body.gamesPlayed).toBe(5)

		const losingDeckStats = await database.getDeckStats(loserDeckCode.body)
		assert(
			losingDeckStats.type === 'success',
			'The stats should be retrieved successfully',
		)
		expect(losingDeckStats.body.wins).toBe(1)
		expect(losingDeckStats.body.losses).toBe(2)
		expect(losingDeckStats.body.forfeitWins).toBe(1)
		expect(losingDeckStats.body.forfeitLosses).toBe(0)
		expect(losingDeckStats.body.ties).toBe(1)
		expect(losingDeckStats.body.gamesPlayed).toBe(5)

		const cardStats = await database.getCardsStats({
			before: null,
			after: null,
			orderBy: null,
		})

		assert(
			cardStats.type === 'success',
			'The card stats should be retrieved successfully',
		)

		expect(
			cardStats.body.find((card) => card.id === BdoubleO100Common.numericId)
				?.winrate,
		).toEqual(0.5)
		expect(
			cardStats.body.find((card) => card.id === EthosLabCommon.numericId)
				?.winrate,
		).toEqual(0.5)
		expect(
			cardStats.body.find((card) => card.id === GeminiTayRare.numericId)
				?.winrate,
		).toEqual(undefined)
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
			playerDeck.iconType,
			playerDeck.cards,
			[tag.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)
		assert(code.type === 'success', 'The deck should be created successfully')

		// Before show data is set
		const returnedDeckWithoutData = await database.getDeckFromID(code.body)

		assert(
			returnedDeckWithoutData.type === 'success',
			'The deck should be retrieved successfully',
		)

		expect(returnedDeckWithoutData.body.name).toBeNull()
		expect(returnedDeckWithoutData.body.icon).toBeNull()
		expect(returnedDeckWithoutData.body.iconType).toBeNull()

		// After show data is set
		await database.setShowData(true, code.body, user.body.uuid)
		const returnedDeckWithData = await database.getDeckFromID(code.body)

		assert(
			returnedDeckWithData.type === 'success',
			'The deck should be retrieved successfully',
		)

		expect(returnedDeckWithData.body.name).toBe('Testing deck')
		expect(returnedDeckWithData.body.icon).toBe('balanced')
		expect(returnedDeckWithData.body.iconType).toBe('item')
		expect(returnedDeckWithData.body.tags).toStrictEqual([tag.body])
		expect(
			returnedDeckWithData.body.cards.map((c) => CARDS[c].numericId),
		).toStrictEqual(playerDeck.cards)

		const allDecks = await database.getDecks(user.body.uuid)
		assert(
			allDecks.type === 'success',
			'The deck should be retrieved successfully',
		)
		expect(allDecks.body[0].cards.map((c) => c.props.numericId)).toStrictEqual(
			playerDeck.cards,
		)
	})

	test('Returning decks with no tags or cards', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		const code = generateDatabaseCode()

		const deck1 = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.iconType,
			[],
			[],
			code,
			user.body.uuid,
		)

		assert(deck1.type === 'success', 'Deck 1 was created successfully')

		const allDecks = await database.getDecks(user.body.uuid)
		const returnedDeckFromId = await database.getDeckFromID(code)

		assert(
			allDecks.type === 'success',
			'The deck should be retrieved successfully',
		)
		assert(
			returnedDeckFromId.type === 'success',
			'The deck should be retrieved successfully',
		)

		const returnedDeckFromGroup = allDecks.body[0]
		expect(returnedDeckFromGroup).toBeTruthy()
		expect(returnedDeckFromGroup?.tags).toStrictEqual([])
		expect(returnedDeckFromGroup?.cards).toStrictEqual([])

		expect(returnedDeckFromId.body).toBeTruthy()
		expect(returnedDeckFromId.body?.tags).toStrictEqual([])
		expect(returnedDeckFromId.body?.cards).toStrictEqual([])
	})

	test('Confirm decks are disassociated from a user properly', async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		const tag = await database.insertTag(
			user.body.uuid,
			'Test Tag',
			'#FF0000',
			generateDatabaseCode(),
		)
		assert(tag.type === 'success', 'The tag should be created successfully')

		// CASE BEFORE EXPORTING
		const withoutExportedCode = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.iconType,
			playerDeck.cards,
			[tag.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)
		assert(
			withoutExportedCode.type === 'success',
			'The deck should be created successfully',
		)

		const deleteResult = await database.deleteDeck(
			withoutExportedCode.body,
			user.body.uuid,
		)

		expect(deleteResult.type).toBe('success')

		const withoutExportedDeck = await database.getDeckFromID(
			withoutExportedCode.body,
		)

		assert(
			withoutExportedDeck.type === 'failure',
			'The deck should not be able to be retrieved',
		)

		// CASE AFTER EXPORTING
		const withExportedCode = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.iconType,
			playerDeck.cards,
			[tag.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)
		assert(
			withExportedCode.type === 'success',
			'The deck should be created successfully',
		)
		await database.setAsExported(withExportedCode.body, user.body.uuid)

		await database.deleteDeck(withExportedCode.body, user.body.uuid)

		const withExportedDeck = await database.getDeckFromID(withExportedCode.body)
		const userDecks = await database.getDecks(user.body.uuid)

		assert(
			withExportedDeck.type === 'success',
			'The deck should be retrieved successfully',
		)
		expect(withExportedDeck.body).toBeTruthy()

		assert(
			userDecks.type === 'success',
			"The user's decks should be retrieved properly",
		)

		expect(userDecks.body).toStrictEqual([])
	})

	test('Confirm tags are deleted properly', async () => {
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
			playerDeck.iconType,
			playerDeck.cards,
			[tag.body.key],
			generateDatabaseCode(),
			user.body.uuid,
		)
		assert(code.type === 'success', 'The deck should be created successfully')

		await database.deleteTag(user.body.uuid, tag.body.key)

		const returnedDeck = await database.getDeckFromID(code.body)

		assert(
			returnedDeck.type === 'success',
			'The deck should be retrieved successfully',
		)

		expect(returnedDeck.body.tags).toStrictEqual([])
	})

	test("Confirm deck deletion doesn't impact other decks", async () => {
		const user = await database.insertUser('Test User', 'ethoslab')
		assert(user.type === 'success', 'The user should be created successfully')

		const deck1 = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.iconType,
			playerDeck.cards,
			[],
			generateDatabaseCode(),
			user.body.uuid,
		)
		const deck2 = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.iconType,
			playerDeck.cards,
			[],
			generateDatabaseCode(),
			user.body.uuid,
		)
		const deck3 = await database.insertDeck(
			playerDeck.name,
			playerDeck.icon,
			playerDeck.iconType,
			playerDeck.cards,
			[],
			generateDatabaseCode(),
			user.body.uuid,
		)
		assert(deck1.type === 'success', 'The deck should be created successfully')
		assert(deck2.type === 'success', 'The deck should be created successfully')
		assert(deck3.type === 'success', 'The deck should be created successfully')

		await database.deleteDeck(deck1.body, user.body.uuid)

		const returnedDeck1 = await database.getDeckFromID(deck1.body)

		expect(returnedDeck1.type).toBe('failure')

		const returnedDeck2 = await database.getDeckFromID(deck2.body)
		const returnedDeck3 = await database.getDeckFromID(deck3.body)

		expect(returnedDeck2.type).toBe('success')
		expect(returnedDeck3.type).toBe('success')
	})
})
