import {Action, actions} from 'logic/actions'

type SocketState = null | 'connecting' | 'connected'

const defaultState: SocketState = null

const loginReducer = (state = defaultState, action: Action): SocketState => {
	switch (action.type) {
		case actions.SOCKET_CONNECTING:
			return 'connecting'
		case actions.SOCKET_CONNECT:
			return 'connected'
		case actions.SOCKET_DISCONNECT:
			return null
		case actions.SOCKET_CONNECT_ERROR:
			return null
		default:
			return state
	}
}

export default loginReducer
