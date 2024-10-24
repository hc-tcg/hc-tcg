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
	action: RecievedClientMessage<typeof clientMessages.PG_ADD_USER>,
) {
	const result = yield* call(
		pgDatabase.insertUser,
		pgDatabase,
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
		pgDatabase.authenticateUser,
		pgDatabase,
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
