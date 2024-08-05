import {SocketAction, socketActions} from './socket-actions'

type SocketState = null | 'connecting' | 'connected'

const defaultState: SocketState = null

const loginReducer = (
	state = defaultState,
	action: SocketAction,
): SocketState => {
	switch (action.type) {
		case socketActions.SOCKET_CONNECTING:
			return 'connecting'
		case socketActions.SOCKET_CONNECT:
			return 'connected'
		case socketActions.SOCKET_DISCONNECT:
			return null
		case socketActions.SOCKET_CONNECT_ERROR:
			return null
		default:
			return state
	}
}

export default loginReducer
