import {getStarterPack} from '../utils/state-gen'

/**
 * @typedef {import('socket.io').Socket} Socket
 */

// @TODO store playerState on player.state, instead of game.state.players, to avoid confusion?

export class Player {
	/**
	 * @param {string} playerName
	 * @param {Socket} socket
	 */
	constructor(playerName, socket) {
		// create a new player

		// @TODO remove "player" in values everywhere, e.g. player.id and player.secret, rather than player.playerId and player.playerSecret
		// need to make sure it's done everywhere tho
		/** @type {string} */
		this.playerId = Math.random().toString()

		/** @type {string} */
		this.playerSecret = Math.random().toString()

		/** @type {Array<string>} */
		this.playerDeck = getStarterPack()

		/** @type {string} */
		this.playerName = playerName

		/** @type {Socket} */
		this.socket = socket
	}

	getPlayerInfo() {
		return {
			playerId: this.playerId,
			playerSecret: this.playerSecret,
			playerDeck: this.playerDeck,
			playerName: this.playerName,
		}
	}
}
