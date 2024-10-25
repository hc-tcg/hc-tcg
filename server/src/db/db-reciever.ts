import {pgDatabase} from 'index'
import {
	RecievedClientMessage,
	clientMessages,
} from '../../../common/socket-messages/client-messages'
import {broadcast} from 'utils/comm'
import root from 'serverRoot'
import {serverMessages} from 'common/socket-messages/server-messages'
import {call} from 'typed-redux-saga'
import {Tag} from 'common/types/deck'

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
	const createdTags = deckTags.filter((tag) => tag.key.includes('NEW'))
	const returnedTags: Tag[] = []
	const oldTags = deckTags.filter((tag) => !tag.key.includes('NEW'))

	for (let i = 0; i < createdTags.length; i++) {
		const newTag = yield* call(
			[pgDatabase, pgDatabase.insertTag],
			player.uuid,
			createdTags[i].name,
			createdTags[i].color,
		)
		if (newTag.type === 'success') returnedTags.push(newTag.body)
	}

	// Insert deck
	const result = yield* call(
		[pgDatabase, pgDatabase.insertDeck],
		action.payload.deck.name,
		action.payload.deck.icon,
		action.payload.deck.cards.map((card) => card.numericId),
		[...oldTags, ...returnedTags].map((tag) => tag.key),
		player.uuid,
	)

	// @TODO make this not jank
	yield* getDecks(action as any)
}

export function* deleteDeck(
	action: RecievedClientMessage<typeof clientMessages.DELETE_DECK>,
) {
	const player = root.players[action.playerId]
	if (!player.authenticated || !player.uuid) {
		return
	}

	const result = yield* call(
		[pgDatabase, pgDatabase.disassociateDeck],
		action.payload.deck.code,
		player.uuid,
	)

	// if (result.type === 'success') {
	// 	broadcast([player], {type: serverMessages.NEW_DECK, user: result.body})
	// } else {
	// 	broadcast([player], {type: serverMessages.AUTHENTICATION_FAIL})
	// }

	// @TODO make this not jank
	yield* getDecks(action as any)
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
