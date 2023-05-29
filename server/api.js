import {createRequire} from 'module'
const require = createRequire(import.meta.url)
import root from './models/root-model'

/**
 * @param {import("express").Express} app
 */
export function registerApis(app) {
	let apiKeys = null
	try {
		apiKeys = require('./apiKeys.json')

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

		console.log('apis registered')
	} catch (err) {
		console.log('no api keys found')
	}
}
