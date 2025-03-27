import {encode} from '@msgpack/msgpack'
import {ServerMessage} from 'common/socket-messages/server-messages'

export function broadcast(
	players: Array<{socket: any} | undefined>,
	message: ServerMessage,
) {
	players.forEach((player) => {
		if (!player) return
		const playerSocket = player.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(message.type, encode(message))
		}
	})
}
