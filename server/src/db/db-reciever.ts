import {pgDatabase} from 'index'
import {
	RecievedClientMessage,
	clientMessages,
} from '../../../common/socket-messages/client-messages'
import {broadcast} from 'utils/comm'
import root from 'serverRoot'
import {serverMessages} from 'common/socket-messages/server-messages'
import {call} from 'typed-redux-saga'

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
		broadcast([player], {type: serverMessages.DECKS_RECIEVED, decks: []})
		return
	}

	const result = yield* call([pgDatabase, pgDatabase.getDecks], player.uuid)

	if (result.type === 'success') {
		broadcast([player], {
			type: serverMessages.DECKS_RECIEVED,
			decks: result.body,
		})
	} else {
		broadcast([player], {type: serverMessages.DECKS_RECIEVED, decks: []})
	}
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
