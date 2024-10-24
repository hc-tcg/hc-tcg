import {PlayerId} from 'common/models/player-model'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {PlayerInfo} from 'common/types/server-requests'
import {validateDeck} from 'common/utils/validation'
import gameSaga from 'logic/game/game-saga'
import {getMatchmaking} from 'logic/matchmaking/matchmaking-selectors'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {
	getActiveDeckName,
	getSavedDeck,
	saveDeck,
	setActiveDeck,
} from 'logic/saved-decks/saved-decks'
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
		let activeDeck = localStorage.getItem('activeDeck')
		if (activeDeck) {
			let deck = getSavedDeck(activeDeck)
			console.log('Select previous active deck')
			if (deck) yield* put<LocalMessage>({type: localMessages.DECK_SET, deck})
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

		const activeDeckName = getActiveDeckName()
		const activeDeck = activeDeckName ? getSavedDeck(activeDeckName) : null
		const activeDeckValid = !!activeDeck && validateDeck(activeDeck.cards).valid

		// if active deck is not valid, generate and save a starter deck
		if (activeDeckValid) {
			// set player deck to active deck, and send to server
			console.log('Selected previous active deck: ' + activeDeck.name)
			yield* sendMsg({type: clientMessages.UPDATE_DECK, deck: activeDeck})
		} else {
			// use and save the generated starter deck
			saveDeck(result.playerInfo.player.playerDeck)
			setActiveDeck(result.playerInfo.player.playerDeck.name)
			console.log('Generated new starter deck')
		}

		// set user info for reconnects
		socket.auth.playerId = result.playerInfo.player.playerId
		socket.auth.playerSecret = result.playerInfo.player.playerSecret

		const secret = localStorage.getItem('databaseInfo:secret')
		const userId = localStorage.getItem('databaseInfo:userId')

		// Create new database user to connect
		if (!secret || !userId) {
			yield* sendMsg({
				type: clientMessages.PG_ADD_USER,
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

			if (userInfo.success) {
			}
		}
	}
}

export function* logoutSaga() {
	const socket = yield* select(getSocket)

	yield* takeEvery<LocalMessageTable[typeof localMessages.DECK_SET]>(
		localMessages.DECK_SET,
		function* (action) {
			yield* sendMsg({type: clientMessages.UPDATE_DECK, deck: action.deck})
		},
	)
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
		const result = yield* call(receiveMsg(socket, serverMessages.NEW_DECK))
		yield put<LocalMessage>({
			type: localMessages.DECK_NEW,
			deck: result.deck,
		})
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
