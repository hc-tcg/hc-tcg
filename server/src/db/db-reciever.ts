import {PlayerModel} from 'common/models/player-model'
import {serverMessages} from 'common/socket-messages/server-messages'
import {GameEndOutcomeT} from 'common/types/game-state'
import {generateDatabaseCode} from 'common/utils/database-codes'
import root from 'serverRoot'
import {call} from 'typed-redux-saga'
import {broadcast} from 'utils/comm'
import {
	RecievedClientMessage,
	clientMessages,
} from '../../../common/socket-messages/client-messages'

export function* addUser(
	action: RecievedClientMessage<typeof clientMessages.PG_INSERT_USER>,
) {
	if (!root.db) return
	const result = yield* call(
		[root.db, root.db.insertUser],
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
	if (!root.db) return
	const result = yield* call(
		[root.db, root.db.authenticateUser],
		action.payload.userId,
		action.payload.secret,
	)

	const player = root.players[action.playerId]

	if (player && result.type === 'success') {
		player.uuid = result.body.uuid
		player.authenticated = true
		broadcast([player], {type: serverMessages.AUTHENTICATED, user: result.body})
	} else {
		broadcast([player], {type: serverMessages.AUTHENTICATION_FAIL})
	}
}

export function* getDecks(
	action: RecievedClientMessage<typeof clientMessages.GET_DECKS>,
) {
	if (!root.db) return
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		broadcast([player], {
			type: serverMessages.DECKS_RECIEVED,
			decks: [],
			tags: [],
		})
		return
	}

	const decksResult = yield* call([root.db, root.db.getDecks], player.uuid)
	const tagsResult = yield* call([root.db, root.db.getTags], player.uuid)

	if (decksResult.type === 'success' && tagsResult.type === 'success') {
		broadcast([player], {
			type: serverMessages.DECKS_RECIEVED,
			decks: decksResult.body,
			tags: tagsResult.body,
			newActiveDeck: action.payload.newActiveDeck
				? decksResult.body.find(
						(deck) => deck.code === action.payload.newActiveDeck,
					)
				: undefined,
		})
	} else if (decksResult.type !== 'success') {
		broadcast([player], {
			type: serverMessages.DATABASE_FAILURE,
			error: decksResult.reason,
		})
	}
}

export function* insertDeck(
	action: RecievedClientMessage<typeof clientMessages.INSERT_DECK>,
) {
	if (!root.db) return
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	const deckTags = action.payload.deck.tags

	for (let i = 0; i < deckTags.length; i++) {
		yield* call(
			[root.db, root.db.insertTag],
			player.uuid,
			deckTags[i].name,
			deckTags[i].color,
			deckTags[i].key,
		)
	}

	// Insert deck
	const result = yield* call(
		[root.db, root.db.insertDeck],
		action.payload.deck.name,
		action.payload.deck.icon,
		action.payload.deck.iconType,
		action.payload.deck.cards.map((card) => card.props.numericId),
		deckTags.map((tag) => tag.key),
		action.payload.deck.code,
		player.uuid,
	)

	if (result.type === 'failure') {
		broadcast([player], {
			type: serverMessages.DATABASE_FAILURE,
			error: result.reason,
		})
		return
	}

	if (action.payload.newActiveDeck) {
		yield* getDecks(action as any)
	}
}

export function* importDeck(
	action: RecievedClientMessage<typeof clientMessages.IMPORT_DECK>,
) {
	if (!root.db) return
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	const code = action.payload.code

	const importedDeck = yield* call([root.db, root.db.getDeckFromID], code)

	if (importedDeck.type !== 'success') return

	// Insert deck
	const result = yield* call(
		[root.db, root.db.insertDeck],
		importedDeck.body.name,
		importedDeck.body.icon,
		importedDeck.body.iconType,
		importedDeck.body.cards.map((card) => card.props.numericId),
		[],
		generateDatabaseCode(),
		player.uuid,
	)

	if (result.type === 'failure') {
		broadcast([player], {
			type: serverMessages.DATABASE_FAILURE,
			error: result.reason,
		})
		return
	}

	if (action.payload.newActiveDeck) yield* getDecks(action as any)
}

export function* deleteDeck(
	action: RecievedClientMessage<typeof clientMessages.DELETE_DECK>,
) {
	if (!root.db) return
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	const result = yield* call(
		[root.db, root.db.disassociateDeck],
		action.payload.deck.code,
		player.uuid,
	)

	if (result.type === 'failure') {
		broadcast([player], {
			type: serverMessages.DATABASE_FAILURE,
			error: result.reason,
		})
	}
}

export function* deleteTag(
	action: RecievedClientMessage<typeof clientMessages.DELETE_TAG>,
) {
	if (!root.db) return
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	const result = yield* call(
		[root.db, root.db.deleteTag],
		player.uuid,
		action.payload.tag.key,
	)

	if (result.type === 'failure') {
		broadcast([player], {
			type: serverMessages.DATABASE_FAILURE,
			error: result.reason,
		})
	}
}

export function* getStats(
	action: RecievedClientMessage<typeof clientMessages.GET_STATS>,
) {
	if (!root.db) return
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

	const result = yield* call([root.db, root.db.getUserStats], player.uuid)

	if (result.type === 'success') {
		broadcast([player], {
			type: serverMessages.STATS_RECIEVED,
			stats: result.body,
		})
	} else {
		if (result.type === 'failure') {
			broadcast([player], {
				type: serverMessages.DATABASE_FAILURE,
				error: result.reason,
			})
		}
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
	if (!root.db) return
	if (!firstPlayerModel.uuid || !secondPlayerModel.uuid) return

	yield* call(
		[root.db, root.db.insertGame],
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
		const stats = yield* call([root.db, root.db.getUserStats], player.uuid)

		if (stats.type !== 'success') {
			broadcast([player], {
				type: serverMessages.DATABASE_FAILURE,
				error: stats.reason,
			})
			continue
		}
		broadcast([player], {
			type: serverMessages.STATS_RECIEVED,
			stats: stats.body,
		})
	}
}