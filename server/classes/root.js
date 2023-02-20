/** The root of the server. All data stored on the server should be (@TODO) accessible from this object */
export class Root {
	constructor() {
		/** @type {Object.<string, import('./player').Player>} */
		this.allPlayers = {}
		/** @type {Object.<string, import('./game').Game>} */
		this.allGames = {}
	}
}
