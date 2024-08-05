import {ServerMessage} from 'common/socket-messages/server-messages'
import {PlayerModel} from '../../../common/models/player-model'

export function broadcast(players: Array<PlayerModel>, message: ServerMessage) {
	players.forEach((player) => {
		const playerSocket = player.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(message.type, message)
		}
	})
}
