import {createRequire} from 'module'
const require = createRequire(import.meta.url)
import root from './models/root-model'
import {CONFIG} from '../config'

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
	}
}

/**
 * @param {import("models/game-model").GameModel} game
 */
export function gameEndWebhook(game) {
	let headers = new Headers()
	headers.append('Content-type', 'application/json')
	try {
		headers.append("api-key", require('./apiKeys.json')[0])
		fetch(CONFIG['gameEndUrl'], {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				createdTime: game.createdTime,
				endTime: Date.now(),
				id: game.id,
				code: game.code,
				playerIds: game.getPlayerIds(),
				playerNames: game.getPlayers().map((p) => p.name),
				endInfo: game.endInfo,
			}),
		}).catch(reason => {})
	} catch {}
}