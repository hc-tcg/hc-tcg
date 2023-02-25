/**
 * @typedef {import('./player-model').Player} Player
 * @typedef {import('./game-model').Game} Game
 */

import {SyncHook} from 'tapable'
import plugins from '../plugins'

export class Root {
	constructor() {
		/** @type {Object.<string, Player>} */
		this.players = {}
		/** @type {Object.<string, Game>} */
		this.games = {}

		this.hooks = {
			/** @type {SyncHook<[Game]>} */
			newGame: new SyncHook(['game']),
			/** @type {SyncHook<[Game]>} */
			gameRemoved: new SyncHook(['game']),
			/** @type {SyncHook<[Player]>} */
			playerJoined: new SyncHook(['player']),
			/** @type {SyncHook<[Player]>} */
			playerLeft: new SyncHook(['player']),
		}
	}

	/** @returns {Array<string>} */
	getGameIds() {
		return Object.keys(this.games)
	}
	/** @returns {Array<Game>} */
	getGames() {
		return Object.values(this.games)
	}
	/** @returns {Array<string>} */
	getPlayerIds() {
		return Object.keys(this.players)
	}
	/** @returns {Array<Player>} */
	getPlayers() {
		return Object.values(this.players)
	}

	/** @param {Player} player */
	addPlayer(player) {
		this.players[player.playerId] = player
	}

	/** @param {Game} game */
	addGame(game) {
		this.games[game.id] = game
	}
}

/** The root of the server. */
const root = new Root()

// initialize plugins
plugins.forEach((plugin) => {
	plugin.register(root)
	console.log('plugin registered: ' + plugin.id)
})

export default root
