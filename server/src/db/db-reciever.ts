import {serverMessages} from 'common/socket-messages/server-messages'
import {generateDatabaseCode} from 'common/utils/database-codes'
import root from 'serverRoot'
import {call} from 'typed-redux-saga'
import {broadcast} from 'utils/comm'
import {
	RecievedClientMessage,
	clientMessages,
} from '../../../common/socket-messages/client-messages'
import {Database, setupDatabase} from './db'
import {CARDS_LIST} from 'common/cards'
import {GameEndOutcomeT} from 'common/types/game-state'
import {PlayerModel} from 'common/models/player-model'

const pgDatabase: Database = setupDatabase(CARDS_LIST, process.env, 8)

export function* addUser(
	action: RecievedClientMessage<typeof clientMessages.PG_INSERT_USER>,
) {
	const result = yield* call(
		[pgDatabase, pgDatabase.insertUser],
		action.payload.username ? action.payload.username : '',
		action.payload.minecraftName,
	)

	const player = root.players[action.playerId]

	if (result.type === 'success') {
		player.uuid = result.body.uuid
		player.authenticated = true
		broadcast([player], {type: serverMessages.AUTHENTICATED, user: result.body})
	} else {
		broadcast([player], {type: serverMessages.AUTHENTICATION_FAIL})
	}
}

export function* authenticateUser(
	action: RecievedClientMessage<typeof clientMessages.PG_AUTHENTICATE>,
) {
	const result = yield* call(
		[pgDatabase, pgDatabase.authenticateUser],
		action.payload.userId,
		action.payload.secret,
	)

	const player = root.players[action.playerId]

	if (result.type === 'success') {
		player.uuid = result.body.uuid
		player.authenticated = true
		broadcast([player], {type: serverMessages.AUTHENTICATED, user: result.body})
	} else {
		broadcast([player], {type: serverMessages.AUTHENTICATION_FAIL})
	}
}

export function* getDecks(
	action: RecievedClientMessage<typeof clientMessages.GET_DECKS>,
	newActiveDeckCode?: string,
) {
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		broadcast([player], {
			type: serverMessages.DECKS_RECIEVED,
			decks: [],
			tags: [],
		})
		return
	}

	const decksResult = yield* call(
		[pgDatabase, pgDatabase.getDecks],
		player.uuid,
	)
	const tagsResult = yield* call([pgDatabase, pgDatabase.getTags], player.uuid)

	if (decksResult.type === 'success' && tagsResult.type === 'success') {
		broadcast([player], {
			type: serverMessages.DECKS_RECIEVED,
			decks: decksResult.body,
			tags: tagsResult.body,
			newActiveDeck: newActiveDeckCode
				? decksResult.body.find((deck) => deck.code === newActiveDeckCode)
				: undefined,
		})
	} else {
		broadcast([player], {
			type: serverMessages.DECKS_RECIEVED,
			decks: [],
			tags: [],
		})
	}
}

export function* insertDeck(
	action: RecievedClientMessage<typeof clientMessages.INSERT_DECK>,
) {
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	const deckTags = action.payload.deck.tags

	for (let i = 0; i < deckTags.length; i++) {
		yield* call(
			[pgDatabase, pgDatabase.insertTag],
			player.uuid,
			deckTags[i].name,
			deckTags[i].color,
			deckTags[i].key,
		)
	}

	// Insert deck
	yield* call(
		[pgDatabase, pgDatabase.insertDeck],
		action.payload.deck.name,
		action.payload.deck.icon,
		action.payload.deck.cards.map((card) => card.numericId),
		deckTags.map((tag) => tag.key),
		action.payload.deck.code,
		player.uuid,
	)
}

export function* importDeck(
	action: RecievedClientMessage<typeof clientMessages.IMPORT_DECK>,
) {
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	const code = action.payload.code

	const importedDeck = yield* call([pgDatabase, pgDatabase.getDeckFromID], code)

	if (importedDeck.type !== 'success') return

	// Insert deck
	yield* call(
		[pgDatabase, pgDatabase.insertDeck],
		importedDeck.body.name,
		importedDeck.body.icon,
		importedDeck.body.cards.map((card) => card.numericId),
		[],
		generateDatabaseCode(),
		player.uuid,
	)

	yield* getDecks(action as any)
}

export function* deleteDeck(
	action: RecievedClientMessage<typeof clientMessages.DELETE_DECK>,
) {
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	yield* call(
		[pgDatabase, pgDatabase.disassociateDeck],
		action.payload.deck.code,
		player.uuid,
	)
}

export function* deleteTag(
	action: RecievedClientMessage<typeof clientMessages.DELETE_TAG>,
) {
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	yield* call(
		[pgDatabase, pgDatabase.deleteTag],
		player.uuid,
		action.payload.tag.key,
	)
}

export function* getStats(
	action: RecievedClientMessage<typeof clientMessages.GET_STATS>,
) {
	const defaultStats = {
		gamesPlayed: 0,
		wins: 0,
		losses: 0,
		forfeitWins: 0,
		forfeitLosses: 0,
		ties: 0,
	}

	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		broadcast([player], {
			type: serverMessages.STATS_RECIEVED,
			stats: defaultStats,
		})
		return
	}

	const result = yield* call([pgDatabase, pgDatabase.getUserStats], player.uuid)

	if (result.type === 'success') {
		broadcast([player], {
			type: serverMessages.STATS_RECIEVED,
			stats: result.body,
		})
	} else {
		broadcast([player], {
			type: serverMessages.STATS_RECIEVED,
			stats: defaultStats,
		})
	}
}

export function* addGame(
	firstPlayerModel: PlayerModel,
	secondPlayerModel: PlayerModel,
	outcome: GameEndOutcomeT,
	gameLength: number,
	winner: string | null,
	seed: string,
	replay: Buffer,
) {
	if (!firstPlayerModel.uuid || !secondPlayerModel.uuid) return

	yield* call(
		[pgDatabase, pgDatabase.insertGame],
		firstPlayerModel.deck.code,
		secondPlayerModel.deck.code,
		firstPlayerModel.uuid,
		secondPlayerModel.uuid,
		outcome,
		gameLength,
		winner,
		seed,
		replay,
	)

	const players = [firstPlayerModel, secondPlayerModel]

	for (let i = 0; i < players.length; i++) {
		const player = players[i]
		if (!player.uuid) continue
		const stats = yield* call(
			[pgDatabase, pgDatabase.getUserStats],
			player.uuid,
		)

		if (stats.type !== 'success') continue
		broadcast([player], {
			type: serverMessages.STATS_RECIEVED,
			stats: stats.body,
		})
	}
}
