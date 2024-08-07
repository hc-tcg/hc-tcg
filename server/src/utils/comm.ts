import {ServerMessage} from 'common/socket-messages/server-messages'

export function broadcast(
	players: Array<{socket: any}>,
	message: ServerMessage,
) {
	players.forEach((player) => {
		const playerSocket = player.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(message.type, message)
		}
	})
}
