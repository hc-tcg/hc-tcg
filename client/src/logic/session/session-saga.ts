import {take, takeEvery, put, call, race, delay} from 'redux-saga/effects'
import {AnyAction} from 'redux'
import {SagaIterator} from 'redux-saga'
import socket from 'socket'
import {sendMsg, receiveMsg} from 'logic/socket/socket-saga'
import {socketConnecting} from 'logic/socket/socket-actions'
import {setPlayerInfo, disconnect, setNewDeck} from './session-actions'

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

export function* loginSaga(): SagaIterator {
	const session = loadSession()
	console.log('session saga: ', session)
	if (!session) {
		const {payload: playerName} = yield take('LOGIN')
		socket.auth = {playerName, version: getClientVersion()}
	} else {
		socket.auth = {...session, version: getClientVersion()}
	}
	yield put(socketConnecting())
	socket.connect()
	const result = yield race({
		playerInfo: call(receiveMsg, 'PLAYER_INFO'),
		invalidPlayer: call(receiveMsg, 'INVALID_PLAYER'),
		playerReconnected: call(receiveMsg, 'PLAYER_RECONNECTED'),
		timeout: delay(5000),
	})

	if (result.invalidPlayer || Object.hasOwn(result, 'timeout')) {
		console.log('Invalid session.')
		clearSession()
		socket.disconnect()
		yield put(disconnect())
		return
	}

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
