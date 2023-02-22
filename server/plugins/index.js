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
	}

	/**
	 * @param {Root} root
	 */
	register(root) {
		root.hooks.newGame.tap(this.id, (game) => {
			game.hooks.gameStart.tap(this.id, () => {
				const playerStates = Object.values(game.state.players)
				const getHand = (pState) => pState.hand.map((card) => card.cardId)
				game.startHand1 = getHand(playerStates[0])
				game.startHand2 = getHand(playerStates[1])
				game.startTimestamp = new Date().getTime()
				if (game.state.order[0] == playerStates[0].id) {
					game.startDeck = 'deck1'
				} else {
					game.startDeck = 'deck2'
				}
			})
			game.hooks.gameEnd.tap(this.id, () => {
				const playerStates = Object.values(game.state.players)
				let summaryObj = {
					startHand1: game.startHand1,
					startHand2: game.startHand2,
					startTimestamp: game.startTimestamp,
					startDeck: game.startDeck,
					endTimestamp: new Date().getTime(),
					turns: game.state.turn,
				}
				let pid0 = playerStates[0].id
				root.allPlayers[pid0].socket.emit(
					'gameoverstat',
					game.deadPlayerId === pid0 ? 'you_lost' : 'you_won'
				)
				summaryObj.deck1 = root.allPlayers[pid0].playerDeck

				let pid1 = playerStates[1].id
				root.allPlayers[pid1].socket.emit(
					'gameoverstat',
					game.deadPlayerId === pid1 ? 'you_lost' : 'you_won'
				)
				summaryObj.deck2 = root.allPlayers[pid1].playerDeck
				if (game.deadPlayerId === pid1) {
					summaryObj.outcome = 'deck1win'
				} else {
					summaryObj.outcome = 'deck2win'
				}
				this.db.ref('/logs').push(summaryObj)
			})
		})
	}
}

export default FirebaseLogs
