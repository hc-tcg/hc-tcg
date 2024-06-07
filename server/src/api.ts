import {CONFIG} from 'common/config'
import {GameModel} from 'common/models/game-model'
import {createRequire} from 'module'
import root from './serverRoot'
import fetch from 'node-fetch'
const require = createRequire(import.meta.url)

export function registerApis(app: import('express').Express) {
	let apiKeys: any = null

	const env = process.env.NODE_ENV || 'development'
	if (env == 'development') {
		console.log('running in dev mode, not activating api')
		return
	}

	try {
		apiKeys = require('./apiKeys.json')

		// get info about games
		app.get('/api/games', (req, res) => {
			const apiKey = req.header('api-key')
			if (apiKey) {
				if (apiKeys?.keys.includes(apiKey)) {
					res.status(201).send(
						JSON.stringify(
							root.getGames().map((g: GameModel) => {
								return {
									createdTime: g.createdTime,
									id: g.id,
									code: g.code,
									playerIds: g.getPlayerIds(),
									playerNames: g.getPlayers().map((p) => p.name),
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
					const code = Math.floor(Math.random() * 10000000).toString(16)

					// Add to private queue with code
					root.privateQueue[code] = {
						createdTime: Date.now(),
						playerId: null,
					}

					console.log(`Private game created via api.`, `Code: ${code}`)

					res.status(201).send({
						code,
					})
				} else {
					res.status(403).send('Access denied - Invalid API key')
				}
			} else {
				res.status(403).send('Access denied.')
			}
		})

		root.hooks.newGame.add('api', (game: GameModel) => {
			try {
				fetch(`${CONFIG.botUrl}/admin/game_start`, {
					method: 'POST',
					headers: [
						['Content-type', 'application/json'],
						['api-key', apiKeys?.botKey],
					],
					body: JSON.stringify({
						createdTime: game.createdTime,
						id: game.id,
						code: game.code,
						playerIds: game.getPlayerIds(),
						playerNames: game.getPlayers().map((p) => p.name),
						state: game.state,
					}),
				})
			} catch (e) {
				console.log('Error notifying discord bot about game start: ' + e)
			}
		})

		root.hooks.gameRemoved.add('api', (game: GameModel) => {
			try {
				fetch(`${CONFIG.botUrl}/admin/game_end`, {
					method: 'POST',
					headers: [
						['Content-type', 'application/json'],
						['api-key', apiKeys?.botKey],
					],
					body: JSON.stringify({
						createdTime: game.createdTime,
						endTime: Date.now(),
						id: game.id,
						code: game.code,
						playerIds: game.getPlayerIds(),
						playerNames: game.getPlayers().map((p) => p.name),
						endInfo: game.endInfo,
					}),
				})
			} catch (e) {
				console.log('Error notifying discord bot about game end: ' + e)
			}
		})

		fetch(`${CONFIG.botUrl}/updates`)
			.then(async (response) => {
				response.json().then((jsonResponse) => {
					root.updates = jsonResponse as Record<string, Array<string>>
				})
			})
			.catch()

		console.log('apis registered')
	} catch (err) {
		console.log('no api keys found')
	}
}
