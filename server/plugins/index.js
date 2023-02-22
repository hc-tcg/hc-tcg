import {createRequire} from 'module'
const require = createRequire(import.meta.url)
const serviceAccount = require('../adminKey.json')
const admin = require('firebase-admin')
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://hc-tcg-leaderboard-default-rtdb.firebaseio.com',
})
/**
 * @typedef {import('../classes/player').Player} Player
 * @typedef {import('../classes/game').Game} Game
 * @typedef {import('../classes/root').Root} Root
 */

class FirebaseLogs {
	constructor() {
		// initialize firebase logs

		this.id = 'firebase_logs'
		this.db = admin.database()

		// temporary solution, store game logs in map of gameId > logs
		/** @type {Object.<string, *>} */
		this.gameLogs = {}
	}

	/**
	 * @param {Root} root
	 */
	register(root) {
		root.hooks.newGame.tap(this.id, (game) => {
			game.hooks.gameStart.tap(this.id, () => {
				const playerStates = Object.values(game.state.players)

				/**
				 * @param {PlayerState} pState
				 */
				function getHand(pState) {
					return pState.hand.map((card) => card.cardId)
				}

				this.gameLogs[game.id] = {
					startHand1: getHand(playerStates[0]),
					startHand2: getHand(playerStates[1]),
					startTimestamp: new Date().getTime(),
				}
				if (game.state.order[0] == playerStates[0].id) {
					this.gameLogs[game.id].startDeck = 'deck1'
				} else {
					this.gameLogs[game.id].startDeck = 'deck2'
				}
			})
			game.hooks.gameEnd.tap(this.id, () => {
				const playerStates = Object.values(game.state.players)
				const gameLog = this.gameLogs[game.id]
				let summaryObj = {
					startHand1: gameLog.startHand1,
					startHand2: gameLog.startHand2,
					startTimestamp: gameLog.startTimestamp,
					startDeck: gameLog.startDeck,
					endTimestamp: new Date().getTime(),
					turns: game.state.turn,
				}
				let pid0 = playerStates[0].id
				root.allPlayers[pid0].socket.emit(
					'gameoverstat',
					gameLog.deadPlayerId === pid0 ? 'you_lost' : 'you_won'
				)
				summaryObj.deck1 = root.allPlayers[pid0].playerDeck

				let pid1 = playerStates[1].id
				root.allPlayers[pid1].socket.emit(
					'gameoverstat',
					gameLog.deadPlayerId === pid1 ? 'you_lost' : 'you_won'
				)
				summaryObj.deck2 = root.allPlayers[pid1].playerDeck
				if (gameLog.deadPlayerId === pid1) {
					summaryObj.outcome = 'deck1win'
				} else {
					summaryObj.outcome = 'deck2win'
				}
				this.db.ref('/logs').push(summaryObj)

				// game is over, delete log
				delete this.gameLogs[game.id]
			})
		})
	}
}

export default FirebaseLogs
