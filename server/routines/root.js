import {all, fork} from 'redux-saga/effects'
import {Game} from './game'
import matchmakingSaga from './matchmaking'
import {playerSaga, Player} from './player'

/** The root of the server. All data stored on the server should be (@TODO) accessible from this object */
export class Root {
	constructor() {
		/** @type {Object.<string, Player>} */
		this.allPlayers = {}
		/** @type {Object.<string, Game>} */
		this.allGames = {}
	}
}

function* rootSaga() {
	console.log('sagas running')
	const root = new Root()
	yield all([fork(matchmakingSaga, root), fork(playerSaga, root)])
}

export default rootSaga
