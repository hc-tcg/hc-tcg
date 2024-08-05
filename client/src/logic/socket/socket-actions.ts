import {Action, actions} from 'common/redux-actions'

export const socketActions = actions(
	'SOCKET_CONNECTING',
	'SOCKET_CONNECT',
	'SOCKET_DISCONNECT',
	'SOCKET_CONNECT_ERROR',
)

export type SocketAction = Action<
	| typeof socketConnecting
	| typeof socketConnect
	| typeof socketDisconnect
	| typeof socketConnectError
>

export const socketConnecting = () => ({type: socketActions.SOCKET_CONNECTING})
export const socketConnect = () => ({type: socketActions.SOCKET_CONNECT})
export const socketDisconnect = () => ({type: socketActions.SOCKET_DISCONNECT})
export const socketConnectError = () => ({
	type: socketActions.SOCKET_CONNECT_ERROR,
})
