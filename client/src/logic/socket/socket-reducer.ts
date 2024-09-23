import {LocalMessage, localMessages} from 'logic/messages'
import {newSocket} from 'socket'

type SocketState = {
	socket: any
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
