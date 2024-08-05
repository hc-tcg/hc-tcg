import {PlayerModel} from '../../../common/models/player-model'

export function broadcast<T extends {type: string}>(
	players: Array<PlayerModel>,
	message: T,
) {
	players.forEach((player) => {
		const playerSocket = player.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(message.type, message)
		}
	})
}
