//import { Socket } from "socket.io-client"

import {getStarterPack} from '../utils/state-gen'

export class Player {
	/**
	 * @param {string} playerName
	 * @param {Socket} socket
	 */
	constructor(playerName, socket) {
		// create a new player
		console.log('new player created')

		/** @type {string} */
		this.playerId = Math.random().toString()

		/** @type {string} */
		this.playerSecret = Math.random().toString()

		/** @type {Array<string>} */
		this.playerDeck = getStarterPack()

		/** @type {string} */
		this.playerName = playerName

		/** @type {import('socket.io-client').Socket} */
		this.socket = socket
	}
}
