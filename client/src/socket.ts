import {decode} from '@msgpack/msgpack'
import {SocketType} from 'logic/socket/socket-reducer'
import io from 'socket.io-client'
import {BASE_URL} from './constants'

export function newSocket(): SocketType {
	const socket = io(BASE_URL, {autoConnect: false})

	socket.on('error', (error) => {
		console.log('Socket error: ', error)
	})

	socket.onAny((event, payload) => {
		console.log('[message]', event, decode(payload))
	})

	//@ts-ignore
	return socket
}
