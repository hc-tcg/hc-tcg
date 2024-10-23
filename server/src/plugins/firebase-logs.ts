import {createRequire} from 'module'
const require = createRequire(import.meta.url)
import {GameLog} from 'common/types/game-state'
import {ServiceAccount} from 'firebase-admin/app'
import {Database} from 'firebase-admin/lib/database/database'
import {RootModel} from 'root-model'

export class FirebaseLogs {
	public id: string = 'firebase_logs'
	public gameLogs: Record<string, GameLog> = {}
	public enabled: boolean = true
	public db: Database | undefined

	constructor() {
		const env = process.env.NODE_ENV || 'development'
		if (env == 'development') {
			console.log('firebase_logs: logging disabled for dev mode')
			this.enabled = false
			return
		}

		try {
			const serviceAccount: ServiceAccount = JSON.parse(
				process.env.FIREBASE_KEY || '',
			)
			const admin = require('firebase-admin')
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: 'https://hc-tcg-leaderboard-default-rtdb.firebaseio.com',
			})
			this.db = admin.database()
		} catch (_err) {
			console.log('No valid firebase key. Statistics will not be stored.')
			this.enabled = false
		}
	}

	register(_root: RootModel): boolean {
		// if (!this.enabled) return false

		// root.hooks.newGame.add(this.id, (game) => {
		// 	if (game.gameCode) {
		// 		// @TODO for now still don't log private games
		// 		return
		// 	}
		// 	const type = game.gameCode ? 'private' : 'public'

		// 	const playerStates = game.components.filter(PlayerComponent)

		// 	this.gameLogs[game.id] = {
		// 		type,
		// 		startHand1: playerStates[0].getHand(),
		// 		startHand2: playerStates[1].getHand(),
		// 		startTimestamp: new Date().getTime(),
		// 		startDeck:
		// 			game.state.order[0] == playerStates[0].entity ? 'deck1' : 'deck2',
		// 	}
		// })

		// root.hooks.gameRemoved.add(this.id, (game) => {
		// 	try {
		// 		const viewers = game.components.filter(ViewerComponent)
		// 		const gameLog = this.gameLogs[game.id]
		// 		if (!gameLog) return

		// 		if (
		// 			!game.endInfo.outcome ||
		// 			['error', 'timeout'].includes(game.endInfo.outcome)
		// 		) {
		// 			delete this.gameLogs[game.id]
		// 			return
		// 		}

		// 		let ref = '/logs'
		// 		let summaryObj: any = {
		// 			startHand1: gameLog.startHand1.map((card) => card.props.id),
		// 			startHand2: gameLog.startHand2.map((card) => card.props.id),
		// 			startTimestamp: gameLog.startTimestamp,
		// 			startDeck: gameLog.startDeck,
		// 			endTimestamp: new Date().getTime(),
		// 			turns: game.state.turn.turnNumber,
		// 			world: CONFIG.world,
		// 		}
		// 		if (gameLog.type === 'private') {
		// 			ref = `/private-logs/${game.gameCode}`
		// 		}

		// 		let pid0 = viewers[0].playerId
		// 		root.players[pid0]?.socket.emit('gameoverstat', {
		// 			outcome: game.endInfo.outcome,
		// 			won: game.endInfo.winner === pid0,
		// 		})
		// 		summaryObj.deck1 = root.players[pid0]?.deck

		// 		let pid1 = viewers[1].playerId
		// 		root.players[pid1]?.socket.emit('gameoverstat', {
		// 			outcome: game.endInfo.outcome,
		// 			won: game.endInfo.winner === pid1,
		// 		})

		// 		summaryObj.deck2 = root.players[pid1]?.deck
		// 		if (game.endInfo.winner === pid0) {
		// 			summaryObj.outcome = 'deck1win'
		// 		} else if (game.endInfo.winner === pid1) {
		// 			summaryObj.outcome = 'deck2win'
		// 		} else {
		// 			summaryObj.outcome = 'tie'
		// 		}
		// 		this.db?.ref(ref).push(summaryObj)
		// 	} catch (err) {
		// 		console.log('Firebase Error: ' + err)
		// 	} finally {
		// 		// game is over, delete log
		// 		delete this.gameLogs[game.id]
		// 	}
		// })

		// return true
		return false
	}
}
