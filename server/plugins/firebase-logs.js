import {createRequire} from 'module'
const require = createRequire(import.meta.url)
import {CONFIG} from '../../config'

/**
 * @typedef {import('models/root-model').RootModel} RootModel
 * @typedef {import('common/types/game-state').PlayerState} PlayerState
 * @typedef {import('common/types/game-state').GameLog} GameLog
 * @typedef {import('firebase-admin').database.Database} Database
 */

class FirebaseLogs {
	constructor() {
		// initialize firebase logs

		this.id = 'firebase_logs'

		/** @type {Object.<string, GameLog>} */
		this.gameLogs = {}

		/** @type {Boolean} */
		this.enabled = true

		try {
			/**
			 * @type {import('firebase-admin').ServiceAccount}
			 */
			const serviceAccount = require('../adminKey.json')
			const admin = require('firebase-admin')
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: 'https://hc-tcg-leaderboard-default-rtdb.firebaseio.com',
			})
			/** @type {Database} */
			this.db = admin.database()
		} catch (err) {
			console.log('No valid firebase key. Statistics will not be stored.')
			this.enabled = false
		}
	}

	/**
	 * @param {RootModel} root
	 */
	register(root) {
		if (!this.enabled) return

		root.hooks.newGame.tap(this.id, (game) => {
			if (game.code) {
				// @TODO for now still don't log private games
				return
			}
			const type = game.code ? 'private' : 'public'

			const playerStates = Object.values(game.state.players)

			/**
			 * @param {PlayerState} pState
			 */
			function getHand(pState) {
				return pState.hand.map((card) => card.cardId)
			}

			this.gameLogs[game.id] = {
				type,
				startHand1: getHand(playerStates[0]),
				startHand2: getHand(playerStates[1]),
				startTimestamp: new Date().getTime(),
				startDeck:
					game.state.order[0] == playerStates[0].id ? 'deck1' : 'deck2',
			}
		})

		root.hooks.gameRemoved.tap(this.id, (game) => {
			const playerStates = Object.values(game.state.players)
			const gameLog = this.gameLogs[game.id]
			if (!gameLog) return

			if (
				!game.endInfo.outcome ||
				['error', 'timeout'].includes(game.endInfo.outcome)
			) {
				delete this.gameLogs[game.id]
				return
			}

			let ref = '/logs'
			let summaryObj = {
				startHand1: gameLog.startHand1,
				startHand2: gameLog.startHand2,
				startTimestamp: gameLog.startTimestamp,
				startDeck: gameLog.startDeck,
				endTimestamp: new Date().getTime(),
				turns: game.state.turn,
				world: CONFIG.world,
			}
			if (gameLog.type === 'private') {
				ref = `/private-logs/${game.code}`
			}

			let pid0 = playerStates[0].id
			root.players[pid0]?.socket.emit('gameoverstat', {
				outcome: game.endInfo.outcome,
				won: game.endInfo.winner === pid0,
			})
			summaryObj.deck1 = root.players[pid0]?.playerDeck

			let pid1 = playerStates[1].id
			root.players[pid1]?.socket.emit('gameoverstat', {
				outcome: game.endInfo.outcome,
				won: game.endInfo.winner === pid1,
			})
			summaryObj.deck2 = root.players[pid1]?.playerDeck
			if (game.endInfo.winner === pid0) {
				summaryObj.outcome = 'deck1win'
			} else if (game.endInfo.winner === pid1) {
				summaryObj.outcome = 'deck2win'
			} else {
				summaryObj.outcome = 'tie'
			}
			this.db.ref(ref).push(summaryObj)

			// game is over, delete log
			delete this.gameLogs[game.id]
		})
	}
}

export default FirebaseLogs
