import {PlayerInfo} from 'common/types/server-requests'
import {validateDeck} from 'common/utils/validation'
import {getDeckFromHash} from 'components/import-export/import-export-utils'
import {
	getActiveDeckName,
	getSavedDeck,
	saveDeck,
	setActiveDeck,
} from 'logic/saved-decks/saved-decks'
import {socketConnecting} from 'logic/socket/socket-actions'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {AnyAction} from 'redux'
import {eventChannel} from 'redux-saga'
import socket from 'socket'
import {PlayerDeckT} from '../../../../common/types/deck'
import {
	disconnect,
	loadUpdates,
	setMinecraftName,
	setNewDeck,
	setPlayerInfo,
} from './session-actions'
import {call, delay, put, race, take, takeEvery} from 'typed-redux-saga'
import {serverMessages} from 'common/socket-messages/server-messages'

const loadSession = (): PlayerInfo | null => {
	const playerName = sessionStorage.getItem('playerName')
	const censoredPlayerName = sessionStorage.getItem('censoredPlayerName')
	const minecraftName = sessionStorage.getItem('minecraftName')
	const playerId = sessionStorage.getItem('playerId')
	const playerSecret = sessionStorage.getItem('playerSecret')
	const playerDeck = JSON.parse(sessionStorage.getItem('playerDeck') || '{}')
	if (
		!playerName ||
		!minecraftName ||
		!censoredPlayerName ||
		!playerId ||
		!playerSecret
	)
		return null
	return {
		playerName,
		minecraftName,
		censoredPlayerName,
		playerId,
		playerSecret,
		playerDeck,
	}
}

const saveSession = (playerInfo: PlayerInfo) => {
	sessionStorage.setItem('playerName', playerInfo.playerName)
	sessionStorage.setItem('censoredPlayerName', playerInfo.playerName)
	sessionStorage.setItem('minecraftName', playerInfo.minecraftName)
	sessionStorage.setItem('playerId', playerInfo.playerId)
	sessionStorage.setItem('playerSecret', playerInfo.playerSecret)
	sessionStorage.setItem('playerDeck', JSON.stringify(playerInfo.playerDeck))
}

const clearSession = () => {
	sessionStorage.removeItem('playerName')
	sessionStorage.removeItem('censoredPlayerName')
	sessionStorage.removeItem('minecraftName')
	sessionStorage.removeItem('playerId')
	sessionStorage.removeItem('playerSecret')
	sessionStorage.removeItem('playerDeck')
}

const getClientVersion = () => {
	const scriptTag = document.querySelector(
		'script[src^="/assets/index"][src$=".js"]',
	) as HTMLScriptElement | null
	if (!scriptTag) return null

	return scriptTag.src.replace(/^.*index-(\w+)\.js/i, '$1')
}

const getDeck: () => PlayerDeckT | null = function () {
	const urlParams = new URLSearchParams(document.location.search || '')
	const hash = urlParams.get('deck')
	const name = urlParams.get('name')
	if (!hash) return null
	const deckCards = getDeckFromHash(hash)
	if (validateDeck(deckCards)) return null
	console.log('Valid deck')
	if (!name) return {cards: deckCards, name: 'Imported deck', icon: 'any'}
	return {cards: deckCards, name: name, icon: 'any'}
}

const createConnectErrorChannel = () =>
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
	const session = loadSession()
	console.log('session saga: ', session)
	if (!session) {
		const {payload: playerName} = yield* take('LOGIN')
		socket.auth = {playerName, version: getClientVersion()}
	} else {
		socket.auth = {...session, version: getClientVersion()}
	}

	const urlDeck = getDeck()

	yield* put(socketConnecting())
	socket.connect()
	const connectErrorChan = createConnectErrorChannel()
	const result = yield* race({
		playerInfo: call(receiveMsg('PLAYER_INFO')),
		invalidPlayer: call(receiveMsg('INVALID_PLAYER')),
		playerReconnected: call(receiveMsg('PLAYER_RECONNECTED')),
		connectError: take(connectErrorChan),
		timeout: delay(8000),
	})

	if (
		result.invalidPlayer ||
		result.connectError ||
		Object.hasOwn(result, 'timeout')
	) {
		clearSession()
		let errorType
		if (result.invalidPlayer) errorType = 'session_expired'
		else if (Object.hasOwn(result, 'timeout')) errorType = 'timeout'
		else if (result.connectError) errorType = result.connectError
		if (socket.connected) socket.disconnect()
		yield put(disconnect(errorType))
		return
	}

	window.history.replaceState({}, '', window.location.pathname)

	if (result.playerReconnected) {
		if (!session) return
		console.log('User reconnected')
		yield put(
			setPlayerInfo({...session, playerDeck: result.playerReconnected.payload}),
		)
	}

	if (result.playerInfo) {
		const payload = result.playerInfo.payload as PlayerInfo
		yield put(setPlayerInfo({...payload}))
		saveSession(payload)

		const minecraftName = localStorage.getItem('minecraftName')
		if (minecraftName) {
			yield call(sendMsg, 'UPDATE_MINECRAFT_NAME', minecraftName)
		} else {
			yield call(sendMsg, 'UPDATE_MINECRAFT_NAME', payload.playerName)
		}

		const activeDeckName = getActiveDeckName()
		const activeDeck = activeDeckName ? getSavedDeck(activeDeckName) : null
		const activeDeckValid = !!activeDeck && !validateDeck(activeDeck.cards)

		// if active deck is not valid, generate and save a starter deck
		if (urlDeck) {
			console.log('Selected deck found in url: ' + urlDeck.name)
			saveDeck(urlDeck)
			setActiveDeck(urlDeck.name)
			yield call(sendMsg, 'UPDATE_DECK', urlDeck)
		} else if (activeDeckValid) {
			// set player deck to active deck, and send to server
			console.log('Selected previous active deck: ' + activeDeck.name)
			yield call(sendMsg, 'UPDATE_DECK', activeDeck)
		} else {
			// use and save the generated starter deck
			saveDeck(payload.playerDeck)
			setActiveDeck(payload.playerDeck.name)
			console.log('Generated new starter deck')
		}

		// set user info for reconnects
		socket.auth.playerId = payload.playerId
		socket.auth.playerSecret = payload.playerSecret
	}
}

export function* logoutSaga() {
	yield* takeEvery('UPDATE_DECK', function* (action: AnyAction) {
		yield call(sendMsg, 'UPDATE_DECK', action.payload)
	})
	yield* takeEvery('UPDATE_MINECRAFT_NAME', function* (action: AnyAction) {
		yield call(sendMsg, 'UPDATE_MINECRAFT_NAME', action.payload)
	})
	yield* race([take('LOGOUT'), call(receiveMsg(serverMessages.INVALID_PLAYER))])
	clearSession()
	socket.disconnect()
	yield put(disconnect())
}

export function* newDeckSaga() {
	while (true) {
		const result = yield* call(receiveMsg(serverMessages.NEW_DECK))
		yield put(setNewDeck(result.payload))
	}
}

export function* minecraftNameSaga() {
	while (true) {
		const result = yield* call(receiveMsg(serverMessages.NEW_MINECRAFT_NAME))
		yield put(setMinecraftName(result.payload))
	}
}

export function* updatesSaga() {
	yield sendMsg('GET_UPDATES', {
		type: 'GET_UPDATES',
		payload: {},
	})
	const result = yield* call(receiveMsg(serverMessages.LOAD_UPDATES))
	yield put(loadUpdates(result.payload))
}
