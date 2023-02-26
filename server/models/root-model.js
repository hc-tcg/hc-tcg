/**
 * @typedef {import('./player-model').PlayerModel} PlayerModel
 * @typedef {import('./game-model').GameModel} GameModel
 */

import {SyncHook} from 'tapable'
import plugins from '../plugins'

export class RootModel {
	constructor() {
		/** @type {Object.<string, PlayerModel>} */
		this.players = {}
		/** @type {Object.<string, GameModel>} */
		this.games = {}

		this.hooks = {
			/** @type {SyncHook<[GameModel]>} */
			newGame: new SyncHook(['game']),
			/** @type {SyncHook<[GameModel]>} */
			gameRemoved: new SyncHook(['game']),
			/** @type {SyncHook<[PlayerModel]>} */
			playerJoined: new SyncHook(['player']),
			/** @type {SyncHook<[PlayerModel]>} */
			playerLeft: new SyncHook(['player']),
		}
	}

	/** @returns {Array<string>} */
	getGameIds() {
		return Object.keys(this.games)
	}
	/** @returns {Array<GameModel>} */
	getGames() {
		return Object.values(this.games)
	}
	/** @returns {Array<string>} */
	getPlayerIds() {
		return Object.keys(this.players)
	}
	/** @returns {Array<PlayerModel>} */
	getPlayers() {
		return Object.values(this.players)
	}

	/** @param {PlayerModel} player */
	addPlayer(player) {
		this.players[player.playerId] = player
	}

	/** @param {GameModel} game */
	addGame(game) {
		this.games[game.id] = game
	}
}

/** The root of the server. */
const root = new RootModel()

// initialize plugins
plugins.forEach((plugin) => {
	plugin.register(root)
	console.log('plugin registered: ' + plugin.id)
})

export default root
