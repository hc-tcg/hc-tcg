import {createRequire} from 'module'
const require = createRequire(import.meta.url)
import root from './models/root-model'
import {CONFIG} from '../config'
import store from '././be-store'
import {inGame, inQueue} from './routines/matchmaking'

/**
 * @param {import("express").Express} app
 */
export function registerApis(app) {
	let apiKeys = null
	try {
		apiKeys = require('./apiKeys.json')
	} catch (err) {
		console.log('no api keys found')
	} finally {
		// get info about games
		app.get('/api/games', (req, res) => {
			const apiKey = req.header('api-key')
			if (apiKey) {
				if (apiKeys?.keys.includes(apiKey)) {
					res.status(201).send(
						JSON.stringify(
							root.getGames().map((g) => {
								return {
									createdTime: g.createdTime,
									id: g.id,
									code: g.code,
									playerIds: g.getPlayerIds(),
									playerNames: g.getPlayers().map((p) => p.playerName),
									state: g.state,
								}
							})
						)
					)
				} else {
					res.status(403).send('Access denied - Invalid API key')
				}
			} else {
				res.status(403).send('Access denied.')
			}
		})

		app.post('/api/createGame', (req, res) => {
			const apiKey = req.header('api-key')
			if (apiKey) {
				if (apiKeys?.keys.includes(apiKey)) {
					//Get both players, check they both exist and are ready to play then add player1 to the game
					var player1 = root
						.getPlayers()
						.find((player) => player.playerId === req.body['player1'])
					var player2 = root
						.getPlayers()
						.find((player) => player.playerId === req.body['player2'])
					if (!player1 || inGame(player1.playerId) || inQueue(player1.playerId))
						return res.status(404).send('player1 not found')
					if (!player2 || inGame(player2.playerId) || inQueue(player2.playerId))
						return res.status(404).send('player2 not found')

					//Add the game to root, respond to client and launch gameManager
					var code =
						Math.floor(Math.random() * 10000000).toString(16) + '_custom'
					store.dispatch({
						type: 'CREATE_CUSTOM_GAME',
						player1: player1,
						player2: player2,
						code: code,
					})
					res.status(201).send({
						code: code,
					})
				} else {
					res.status(403).send('Access denied - Invalid API key')
				}
			} else {
				res.status(403).send('Access denied.')
			}
		})
	}
}

/**
 * @param {import("models/game-model").GameModel} game
 */
export function gameEndWebhook(game) {
	let headers = new Headers()
	headers.append('Content-type', 'application/json')
	try {
		headers.append('api-key', require('./apiKeys.json')[0])
		fetch(`${CONFIG['gameEndUrl']}/admin/game_end`, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				createdTime: game.createdTime,
				endTime: Date.now(),
				id: game.id,
				code: game.code,
				playerIds: game.getPlayerIds(),
				playerNames: game.getPlayers().map((p) => p.playerName),
				endInfo: game.endInfo,
			}),
		}).catch((reason) => {})
	} catch {}
}

/**
 * @param {import("models/player-model").PlayerModel} player
 */
export function newPlayerWebhook(player) {
	let headers = new Headers()
	headers.append('Content-type', 'application/json')
	try {
		headers.append('api-key', require('./apiKeys.json')[0])
		fetch(`${CONFIG['gameEndUrl']}/tcg/newPlayer`, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				id: player.playerId,
				name: player.censoredPlayerName,
				code: player.code,
			}),
		}).catch((reason) => {})
	} catch {}
}

/**
 * @param {import("models/player-model").PlayerModel} player
 */
export function deletePlayerWebhook(player) {
	let headers = new Headers()
	headers.append('Content-type', 'application/json')
	try {
		headers.append('api-key', require('./apiKeys.json')[0])
		fetch(`${CONFIG['gameEndUrl']}/tcg/deletePlayer`, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				id: player.playerId,
			}),
		}).catch((reason) => {})
	} catch {}
}