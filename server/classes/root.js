/**
 * @typedef {import('./player').Player} Player
 * @typedef {import('./game').Game} Game
 */

import {SyncHook} from 'tapable'
import plugins from '../configs'

export class Root {
	constructor() {
		/** @type {Object.<string, Player>} */
		this.allPlayers = {}
		/** @type {Object.<string, Game>} */
		this.allGames = {}

		this.hooks = {
			/** @type {SyncHook<Game>} */
			newGame: new SyncHook(['game']),
			/** @type {SyncHook<Player>} */
			playerJoined: new SyncHook(['player']),
			/** @type {SyncHook<Player>} */
			playerLeft: new SyncHook(['player']),
		}
	}
}

/** The root of the server. All data stored on the server is accessible from this object */
const root = new Root()

// initialize plugins
plugins.forEach((plugin) => {
	plugin.register(root)
	console.log('plugin registered: ' + plugin.id)
})

export default root
