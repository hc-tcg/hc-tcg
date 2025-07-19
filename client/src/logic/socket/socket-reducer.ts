import {Appearance} from 'common/cosmetics/types'
import {PlayerId} from 'common/models/player-model'
import {LocalMessage, localMessages} from 'logic/messages'
import {newSocket} from 'socket'

export type SocketType = {
	auth: {
		version: string | null
		playerName: string
		minecraftName: string
		playerId?: PlayerId
		playerUuid: string
		playerSecret: string
		appearance: Appearance
	}
	connected: boolean
	connect: () => void
	disconnect: () => void
	on: (t: string, f: () => any) => void
	off: (t: string, f: () => any) => void
	emit: (type: string, bytes: Uint8Array) => void
} | null

type SocketState = {
	socket: SocketType
	status: null | 'connecting' | 'connected'
}

const loginReducer = (
	state: SocketState = {socket: null, status: null},
	action: LocalMessage,
): SocketState => {
	if (state.socket === null) {
		state.socket = newSocket()
	}

	switch (action.type) {
		case localMessages.SOCKET_CONNECTING:
			return {...state, status: 'connecting'}
		case localMessages.SOCKET_CONNECT:
			return {...state, status: 'connected'}
		case localMessages.SOCKET_DISCONNECT:
			return {...state, status: null}
		case localMessages.SOCKET_CONNECT_ERROR:
			return {...state, status: null}
		default:
			return state
	}
}

export default loginReducer
