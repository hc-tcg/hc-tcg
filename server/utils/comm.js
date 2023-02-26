/**
 * @typedef {import('models/player-model').PlayerModel} PlayerModel
 */

/**
 *
 * @param {Array<PlayerModel>} players
 * @param {string} type
 * @param {*} payload
 */
export function broadcast(players, type, payload = {}) {
	players.forEach((player) => {
		const playerSocket = player.socket
		if (playerSocket && playerSocket.connected) {
			playerSocket.emit(type, {type: type, payload})
		}
	})
}
