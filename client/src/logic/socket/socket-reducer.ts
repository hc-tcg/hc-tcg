import {LocalMessage, localMessages} from 'logic/messages'

type SocketState = null | 'connecting' | 'connected'

const defaultState: SocketState = null

const loginReducer = (
	state = defaultState,
	action: LocalMessage,
): SocketState => {
	switch (action.type) {
		case localMessages.SOCKET_CONNECTING:
			return 'connecting'
		case localMessages.SOCKET_CONNECT:
			return 'connected'
		case localMessages.SOCKET_DISCONNECT:
			return null
		case localMessages.SOCKET_CONNECT_ERROR:
			return null
		default:
			return state
	}
}

export default loginReducer
