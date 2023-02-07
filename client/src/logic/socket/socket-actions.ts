export const socketConnecting = () => ({type: 'SOCKET_CONNECTING' as const})
export const socketConnect = () => ({type: 'SOCKET_CONNECT' as const})
export const socketDisconnect = () => ({type: 'SOCKET_DISCONNECT' as const})
export const socketConnectError = () => ({
	type: 'SOCKET_CONNECT_ERROR' as const,
})
