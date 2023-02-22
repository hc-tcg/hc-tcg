import {createRequire} from 'module'
const require = createRequire(import.meta.url)

/**
 * @typedef {import('models/player-model').Player} Player
 * @typedef {import('models/game-model').Game} Game
 * @typedef {import('models/root-model').Root} Root
 */

class FirebaseLogs {
	constructor() {
		// initialize firebase logs

		this.id = 'firebase_logs'

		// temporary solution, store game logs in map of gameId > logs
		/** @type {Object.<string, *>} */
		this.gameLogs = {}

		/** @type {Boolean} */
		this.enabled = true

		try {
			const serviceAccount = require('../adminKey.json')
			const admin = require('firebase-admin')
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: 'https://hc-tcg-leaderboard-default-rtdb.firebaseio.com',
			})
			this.db = admin.database()
		} catch (err) {
			console.log('No valid firebase key. Statistics will not be stored.')
			this.enabled = false
		}
	}

	/**
	 * @param {Root} root
	 */
	register(root) {
		if (!this.enabled) return

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
				if (!game.endInfo.deadPlayerId) {
					delete this.gameLogs[game.id]
					return
				}

				let summaryObj = {
					startHand1: gameLog.startHand1,
					startHand2: gameLog.startHand2,
					startTimestamp: gameLog.startTimestamp,
					startDeck: gameLog.startDeck,
					endTimestamp: new Date().getTime(),
					turns: game.state.turn,
				}
				let pid0 = playerStates[0].id
				root.players[pid0].socket.emit(
					'gameoverstat',
					game.endInfo.deadPlayerId === pid0 ? 'you_lost' : 'you_won'
				)
				summaryObj.deck1 = root.players[pid0].playerDeck

				let pid1 = playerStates[1].id
				root.players[pid1].socket.emit(
					'gameoverstat',
					game.endInfo.deadPlayerId === pid1 ? 'you_lost' : 'you_won'
				)
				summaryObj.deck2 = root.players[pid1].playerDeck
				if (game.endInfo.deadPlayerId === pid1) {
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
