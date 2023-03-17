import {take, takeEvery, put, call, race, delay} from 'redux-saga/effects'
import {AnyAction} from 'redux'
import {SagaIterator, eventChannel} from 'redux-saga'
import socket from 'socket'
import {sendMsg, receiveMsg} from 'logic/socket/socket-saga'
import {socketConnecting} from 'logic/socket/socket-actions'
import {setPlayerInfo, disconnect, setNewDeck} from './session-actions'
import {getDeckFromHash} from 'components/import-export/import-export-utils'

type PlayerInfoT = {
	playerName: string
	playerId: string
	playerSecret: string
}

const loadSession = (): PlayerInfoT | null => {
	const playerName = sessionStorage.getItem('playerName')
	const playerId = sessionStorage.getItem('playerId')
	const playerSecret = sessionStorage.getItem('playerSecret')
	if (!playerName || !playerId || !playerSecret) return null
	return {playerName, playerId, playerSecret}
}

const saveSession = (playerInfo: PlayerInfoT) => {
	sessionStorage.setItem('playerName', playerInfo.playerName)
	sessionStorage.setItem('playerId', playerInfo.playerId)
	sessionStorage.setItem('playerSecret', playerInfo.playerSecret)
}

const clearSession = () => {
	sessionStorage.removeItem('playerName')
	sessionStorage.removeItem('playerId')
	sessionStorage.removeItem('playerSecret')
}

const getClientVersion = () => {
	const scriptTag = document.querySelector(
		'script[src^="/assets/index"][src$=".js"]'
	) as HTMLScriptElement | null
	if (!scriptTag) return null

	return scriptTag.src.replace(/^.*index-(\w+)\.js/i, '$1')
}

const getDeck = () => {
	const urlParams = new URLSearchParams(document.location.search || '')
	const hash = urlParams.get('deck')
	if (!hash) return null
	const deckCards = getDeckFromHash(hash)
	const deck = deckCards.map((card) => card.cardId)
	return deck
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

export function* loginSaga(): SagaIterator {
	const session = loadSession()
	console.log('session saga: ', session)
	if (!session) {
		const {payload: playerName} = yield take('LOGIN')
		socket.auth = {playerName, version: getClientVersion()}
	} else {
		socket.auth = {...session, version: getClientVersion()}
	}

	const deck = getDeck()
	if (deck) socket.auth.deck = deck

	yield put(socketConnecting())
	socket.connect()
	const connectErrorChan = createConnectErrorChannel()
	const result = yield race({
		playerInfo: call(receiveMsg, 'PLAYER_INFO'),
		invalidPlayer: call(receiveMsg, 'INVALID_PLAYER'),
		playerReconnected: call(receiveMsg, 'PLAYER_RECONNECTED'),
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
			setPlayerInfo({...session, playerDeck: result.playerReconnected.payload})
		)
	}

	if (result.playerInfo) {
		const {payload} = result.playerInfo
		console.log('New player info: ', payload)
		yield put(setPlayerInfo(payload))
		saveSession(payload)

		// set user info for reconnects
		socket.auth.playerId = payload.playerId
		socket.auth.playerSecret = payload.playerSecret
	}
}

export function* logoutSaga(): SagaIterator {
	yield takeEvery('UPDATE_DECK', function* (action: AnyAction) {
		yield call(sendMsg, 'UPDATE_DECK', action.payload)
	})
	yield race([take('LOGOUT'), call(receiveMsg, 'INVALID_PLAYER')])
	clearSession()
	socket.disconnect()
	yield put(disconnect())
}

export function* newDeckSaga(): SagaIterator {
	while (true) {
		const result = yield call(receiveMsg, 'NEW_DECK')
		yield put(setNewDeck(result.payload))
	}
}
