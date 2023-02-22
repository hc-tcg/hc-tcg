/**
 * @typedef {import('./player').Player} Player
 * @typedef {import('./game').Game} Game
 */

import {SyncHook} from 'tapable'

export class Root {
	constructor() {
		/** @type {Object.<string, Player>} */
		this.allPlayers = {}
		/** @type {Object.<string, Game>} */
		this.allGames = {}

		this.hooks = {
			newGame: new SyncHook(['game']),
			playerJoined: new SyncHook(['player']),
			playerLeft: new SyncHook(['player']),
		}
	}
}

/** @type {Root} The root of the server. All data stored on the server is accessible from this object */
export default new Root()
