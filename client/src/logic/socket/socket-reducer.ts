import {AnyAction} from "redux"

type SocketState = null | "connecting" | "connected"

const defaultState: SocketState = null

const loginReducer = (state = defaultState, action: AnyAction): SocketState => {
	switch (action.type) {
		case "SOCKET_CONNECTING":
			return "connecting"
		case "SOCKET_CONNECT":
			return "connected"
		case "SOCKET_DISCONNECT":
			return null
		case "CONNECT_ERROR":
			return null
		default:
			return state
	}
}

export default loginReducer
