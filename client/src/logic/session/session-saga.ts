import {PlayerId} from 'common/models/player-model'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {PlayerInfo} from 'common/types/server-requests'
import gameSaga from 'logic/game/game-saga'
import {getMatchmaking} from 'logic/matchmaking/matchmaking-selectors'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {getActiveDeck, toPlayerDeck} from 'logic/saved-decks/saved-decks'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {eventChannel} from 'redux-saga'
import {call, delay, put, race, select, take, takeEvery} from 'typed-redux-saga'

const loadSession = () => {
	const playerName = sessionStorage.getItem('playerName')
	const censoredPlayerName = sessionStorage.getItem('censoredPlayerName')
	const playerId = sessionStorage.getItem('playerId') as PlayerId
	const playerSecret = sessionStorage.getItem('playerSecret')

	if (!playerName || !censoredPlayerName || !playerId || !playerSecret)
		return null
	return {
		playerName,
		censoredPlayerName,
		playerId,
		playerSecret,
	}
}

const saveSession = (playerInfo: PlayerInfo) => {
	sessionStorage.setItem('playerName', playerInfo.playerName)
	sessionStorage.setItem('censoredPlayerName', playerInfo.playerName)
	sessionStorage.setItem('playerId', playerInfo.playerId)
	sessionStorage.setItem('playerSecret', playerInfo.playerSecret)
}

const clearSession = () => {
	sessionStorage.removeItem('playerName')
	sessionStorage.removeItem('censoredPlayerName')
	sessionStorage.removeItem('playerId')
	sessionStorage.removeItem('playerSecret')
}

const getClientVersion = () => {
	const scriptTag = document.querySelector(
		'script[src^="/assets/index"][src$=".js"]',
	) as HTMLScriptElement | null
	if (!scriptTag) return null

	return scriptTag.src.replace(/^.*index-(\w+)\.js/i, '$1')
}

const createConnectErrorChannel = (socket: any) =>
	eventChannel((emit) => {
		const connectErrorListener = (err: Error | null) => {
			if (err instanceof Error) return emit(err.message)
			if (typeof err === 'string') return emit(err)
			console.error(err)
		}
		socket.on('connect_error', connectErrorListener)
		return () => socket.off('connect_error', connectErrorListener)
	})

function* setupData(socket: any) {
	yield* sendMsg({
		type: clientMessages.GET_DECKS,
	})
	const decks = yield* call(receiveMsg(socket, serverMessages.DECKS_RECIEVED))
	yield* put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'decks',
			value: decks.decks,
		},
	})
	yield put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'tags',
			value: decks.tags,
		},
	})

	yield* sendMsg({
		type: clientMessages.GET_STATS,
	})
	const stats = yield* call(receiveMsg(socket, serverMessages.STATS_RECIEVED))
	yield* put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'stats',
			value: stats.stats,
		},
	})
}

export function* loginSaga() {
	const socket = yield* select(getSocket)
	const session = loadSession()

	console.log('session saga: ', session)
	if (!session) {
		const {name} = yield* take<LocalMessageTable[typeof localMessages.LOGIN]>(
			localMessages.LOGIN,
		)

		socket.auth = {playerName: name, version: getClientVersion()}
	} else {
		socket.auth = {...session, version: getClientVersion()}
	}

	yield* put<LocalMessage>({type: localMessages.SOCKET_CONNECTING})
	socket.connect()
	const connectErrorChan = createConnectErrorChannel(socket)

	const result = yield* race({
		playerInfo: call(receiveMsg(socket, serverMessages.PLAYER_INFO)),
		invalidPlayer: call(receiveMsg(socket, serverMessages.INVALID_PLAYER)),
		playerReconnected: call(
			receiveMsg(socket, serverMessages.PLAYER_RECONNECTED),
		),
		connectError: take(connectErrorChan),
		timeout: delay(8000),
	})

	if (result.invalidPlayer || result.connectError || result.timeout) {
		clearSession()
		let errorType
		if (result.invalidPlayer) errorType = 'session_expired'
		else if (Object.hasOwn(result, 'timeout')) errorType = 'timeout'
		else if (result.connectError) errorType = result.connectError
		if (socket.connected) socket.disconnect()
		if (typeof errorType !== 'string')
			throw new Error(
				'For some unknown reason, `errorType` is a string even though the type system claims otherwise.',
			)
		yield put<LocalMessage>({
			type: localMessages.DISCONNECT,
			errorMessage: errorType,
		})
		return
	}

	window.history.replaceState({}, '', window.location.pathname)

	if (result.playerReconnected) {
		if (!session) return
		console.log('User reconnected')
		yield put<LocalMessage>({
			type: localMessages.PLAYER_SESSION_SET,
			player: session,
		})
		yield* setupData(socket)
		let activeDeck = getActiveDeck()
		if (activeDeck) {
			console.log('Select previous active deck')
			yield* put<LocalMessage>({
				type: localMessages.SELECT_DECK,
				deck: activeDeck,
			})
		}
		let minecraftName = localStorage.getItem('minecraftName')
		if (minecraftName)
			yield* put<LocalMessage>({
				type: localMessages.MINECRAFT_NAME_SET,
				name: minecraftName,
			})

		if (result.playerReconnected.game) {
			const matchmakingStatus = (yield* select(getMatchmaking)).status

			// Only start a new game saga if the player is not in a game.
			if (matchmakingStatus !== 'in_game') {
				yield* call(gameSaga, result.playerReconnected.game)
				yield* put<LocalMessage>({type: localMessages.MATCHMAKING_LEAVE})
			}
		}
	}

	if (result.playerInfo) {
		yield put<LocalMessage>({
			type: localMessages.PLAYER_INFO_SET,
			player: result.playerInfo.player,
		})
		saveSession(result.playerInfo.player)

		const minecraftName = localStorage.getItem('minecraftName')
		if (minecraftName) {
			yield* sendMsg({
				type: clientMessages.UPDATE_MINECRAFT_NAME,
				name: minecraftName,
			})
		} else {
			yield* sendMsg({
				type: clientMessages.UPDATE_MINECRAFT_NAME,
				name: result.playerInfo.player.playerName,
			})
		}

		// Set active deck
		const activeDeck = getActiveDeck()

		if (activeDeck) {
			console.log('Selected previous active deck: ' + activeDeck.name)
			yield* put<LocalMessage>({
				type: localMessages.SELECT_DECK,
				deck: activeDeck,
			})
			yield* sendMsg({
				type: clientMessages.UPDATE_DECK,
				deck: {...toPlayerDeck(activeDeck), code: activeDeck.code},
			})
		}

		// set user info for reconnects
		socket.auth.playerId = result.playerInfo.player.playerId
		socket.auth.playerSecret = result.playerInfo.player.playerSecret

		const secret = localStorage.getItem('databaseInfo:secret')
		const userId = localStorage.getItem('databaseInfo:userId')

		// Create new database user to connect
		if (!secret || !userId) {
			yield* sendMsg({
				type: clientMessages.PG_INSERT_USER,
				username: result.playerInfo.player.playerName,
				minecraftName: minecraftName,
			})

			const userInfo = yield* race({
				success: call(receiveMsg(socket, serverMessages.AUTHENTICATED)),
				failure: call(receiveMsg(socket, serverMessages.AUTHENTICATION_FAIL)),
			})

			if (userInfo.success?.user) {
				yield* put<LocalMessage>({
					type: localMessages.SET_ID_AND_SECRET,
					userId: userInfo.success.user.uuid,
					secret: userInfo.success.user.secret,
				})
			}
		} else {
			yield* sendMsg({
				type: clientMessages.PG_AUTHENTICATE,
				userId: userId,
				secret: secret,
			})

			const userInfo = yield* race({
				success: call(receiveMsg(socket, serverMessages.AUTHENTICATED)),
				failure: call(receiveMsg(socket, serverMessages.AUTHENTICATION_FAIL)),
			})

			if (userInfo.success) yield* setupData(socket)
		}
	}
}

export function* databaseConnectionSaga() {
	yield* takeEvery<LocalMessageTable[typeof localMessages.INSERT_DECK]>(
		localMessages.INSERT_DECK,
		function* (action) {
			yield* sendMsg({type: clientMessages.INSERT_DECK, deck: action.deck})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.IMPORT_DECK]>(
		localMessages.IMPORT_DECK,
		function* (action) {
			yield* sendMsg({type: clientMessages.IMPORT_DECK, code: action.code})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.DELETE_DECK]>(
		localMessages.DELETE_DECK,
		function* (action) {
			yield* sendMsg({type: clientMessages.DELETE_DECK, deck: action.deck})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.DELETE_TAG]>(
		localMessages.DELETE_TAG,
		function* (action) {
			yield* sendMsg({type: clientMessages.DELETE_TAG, tag: action.tag})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.UPDATE_DECKS]>(
		localMessages.UPDATE_DECKS,
		function* () {
			yield* sendMsg({type: clientMessages.GET_DECKS})
		},
	)
	yield* takeEvery<
		LocalMessageTable[typeof localMessages.UPDATE_DECKS_THEN_SELECT]
	>(localMessages.UPDATE_DECKS_THEN_SELECT, function* (action) {
		yield* sendMsg({
			type: clientMessages.GET_DECKS_THEN_SELECT,
			code: action.code,
		})
	})
}

export function* logoutSaga() {
	const socket = yield* select(getSocket)

	yield* takeEvery<LocalMessageTable[typeof localMessages.MINECRAFT_NAME_SET]>(
		localMessages.MINECRAFT_NAME_SET,
		function* (action) {
			yield* sendMsg({
				type: clientMessages.UPDATE_MINECRAFT_NAME,
				name: action.name,
			})
		},
	)
	yield* race([
		take(localMessages.LOGOUT),
		call(receiveMsg(socket, serverMessages.INVALID_PLAYER)),
	])
	clearSession()
	socket.disconnect()
	yield put<LocalMessage>({type: localMessages.DISCONNECT})
}

export function* newDeckSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(
			receiveMsg(socket, serverMessages.DECKS_RECIEVED),
		)
		yield put<LocalMessage>({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'decks',
				value: result.decks,
			},
		})
		yield put<LocalMessage>({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'tags',
				value: result.tags,
			},
		})
		if (result.newActiveDeck) {
			// Select new active deck
			localStorage.setItem('activeDeck', JSON.stringify(result.newActiveDeck))
			yield* put<LocalMessage>({
				type: localMessages.SELECT_DECK,
				deck: result.newActiveDeck,
			})
		}
	}
}

export function* minecraftNameSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(
			receiveMsg(socket, serverMessages.NEW_MINECRAFT_NAME),
		)
		yield put<LocalMessage>({
			type: localMessages.MINECRAFT_NAME_NEW,
			name: result.name,
		})
	}
}

export function* updatesSaga() {
	const socket = yield* select(getSocket)
	yield sendMsg({type: clientMessages.GET_UPDATES})
	const result = yield* call(receiveMsg(socket, serverMessages.LOAD_UPDATES))
	yield put<LocalMessage>({
		type: localMessages.UPDATES_LOAD,
		updates: result.updates,
	})
}
