import {PlayerModel} from "../../../common/models/player-model"

export function broadcast(
	players: Array<PlayerModel>,
	type: string,
	payload: any = {},
) {
	players.forEach((player) => {
		const playerSocket = player.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(type, {type: type, payload})
		}
	})
}
