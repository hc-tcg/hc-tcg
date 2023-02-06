import {take, put, call, race, delay} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import socket from 'socket'
import {receiveMsg} from 'logic/socket/socket-saga'
import {socketConnecting} from 'logic/socket/socket-actions'
import {setPlayerInfo, disconnect} from './session-actions'

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

export function* loginSaga(): SagaIterator {
	const session = loadSession()
	console.log('session saga: ', session)
	if (!session) {
		const {payload: playerName} = yield take('LOGIN')
		socket.auth = {playerName}
	} else {
		socket.auth = session
	}
	yield put(socketConnecting())
	socket.connect()
	const result = yield race({
		playerInfo: call(receiveMsg, 'PLAYER_INFO'),
		invalidPlayer: call(receiveMsg, 'INVALID_PLAYER'),
		playerReconnected: call(receiveMsg, 'PLAYER_RECONNECTED'),
		timeout: delay(5000),
	})

	if (result.invalidPlayer || result.hasOwnProperty('timeout')) {
		console.log('Invalid session.')
		clearSession()
		socket.disconnect()
		yield put(disconnect())
		return
	}

	if (result.playerReconnected) {
		if (!session) return
		console.log('User reconnected')
		yield put(setPlayerInfo(session))
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
	yield race([take('LOGOUT'), call(receiveMsg, 'INVALID_PLAYER')])
	clearSession()
	socket.disconnect()
	yield put(disconnect())
}
