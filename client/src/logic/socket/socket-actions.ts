import {Message, messages} from 'common/redux-actions'

export const socketActions = messages(
	'SOCKET_CONNECTING',
	'SOCKET_CONNECT',
	'SOCKET_DISCONNECT',
	'SOCKET_CONNECT_ERROR',
)

export type SocketActions = [
	{type: typeof socketActions.SOCKET_CONNECT},
	{type: typeof socketActions.SOCKET_CONNECTING},
	{type: typeof socketActions.SOCKET_DISCONNECT},
	{type: typeof socketActions.SOCKET_CONNECT_ERROR},
]

export type SocketMessage = Message<SocketActions>
