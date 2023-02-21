/**
 * @typedef {import('./player').Player} Player
 * @typedef {import('./game').Game} Game
 */

//@TODO root singleton?
/** The root of the server. All data stored on the server should be (@TODO) accessible from this object */

export class Root {
	constructor() {
		/** @type {Object.<string, Player>} */
		this.allPlayers = {}
		/** @type {Object.<string, Game>} */
		this.allGames = {}
	}
}
