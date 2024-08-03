import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel} from 'common/models/game-model'
import fetch from 'node-fetch'
import root from './serverRoot'

function getPlayers(game: GameModel) {
	return game.components.filter(ViewerComponent).flatMap((viewer) => {
		if (viewer.spectator) return []
		let player = viewer.playerOnLeft
		return [
			{
				playerId: viewer.playerId,
				playerName: player.playerName,
				censoredPlayerName: player.censoredPlayerName,
				minecraftName: player.minecraftName,
				lives: player.lives,
				deck: player.getDeck().map((card) => card.props.id),
			},
		]
	})
}

export function registerApis(app: import('express').Express) {
	let apiKeys: any = null
	let botKey: any = null

	const env = process.env.NODE_ENV || 'development'
	if (env == 'development') {
		console.log('running in dev mode, not activating api')
		//return
	}

	try {
		apiKeys = JSON.parse(process.env.API_KEYS || '')
		botKey = process.env.BOT_KEY

		// get info about games
		app.get('/api/games', (req, res) => {
			const apiKey = req.header('api-key')
			if (apiKey) {
				if (apiKeys.includes(apiKey)) {
					res.status(201).send(
						JSON.stringify(
							root.getGames().map((g: GameModel) => {
								return {
									createdTime: g.createdTime,
									id: g.id,
									code: g.code,
									players: getPlayers(g),
									state: g.state,
								}
							}),
						),
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
				if (apiKeys.includes(apiKey)) {
					const code = Math.floor(Math.random() * 10000000).toString(16)

					// Add to private queue with code
					root.privateQueue[code] = {
						createdTime: Date.now(),
						playerId: null,
					}

					console.log('Private game created via api.', `Code: ${code}`)

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
				fetch(`${process.env.BOT_URL}/admin/game_start`, {
					method: 'POST',
					headers: [
						['Content-type', 'application/json'],
						['api-key', botKey],
					],
					body: JSON.stringify({
						createdTime: game.createdTime,
						id: game.id,
						code: game.code,
						players: getPlayers(game),
						state: game.state,
					}),
				})
			} catch (e) {
				console.log('Error notifying discord bot about game start: ' + e)
			}
		})

		root.hooks.gameRemoved.add('api', (game: GameModel) => {
			try {
				fetch(`${process.env.BOT_URL}/admin/game_end`, {
					method: 'POST',
					headers: [
						['Content-type', 'application/json'],
						['api-key', botKey],
					],
					body: JSON.stringify({
						createdTime: game.createdTime,
						endTime: Date.now(),
						id: game.id,
						code: game.code,
						players: getPlayers(game),
						endInfo: game.endInfo,
						state: game.state,
					}),
				})
			} catch (e) {
				console.log('Error notifying discord bot about game end: ' + e)
			}
		})

		root.hooks.privateCancelled.add('api', (code: string) => {
			try {
				fetch(`${process.env.BOT_URL}/admin/private_cancel`, {
					method: 'POST',
					headers: [
						['Content-type', 'application/json'],
						['api-key', botKey],
					],
					body: JSON.stringify({
						code: code,
					}),
				})
			} catch (e) {
				console.log(
					'Error notifying discord bot about cancelled private game: ' + e,
				)
			}
		})

		fetch(`${process.env.BOT_URL}/updates`)
			.then(async (response) => {
				response.json().then((jsonResponse) => {
					root.updates = jsonResponse as Record<string, Array<string>>
				})
			})
			.catch()

		console.log('apis registered')
	} catch (_err) {
		console.log('no api keys found')
	}
}
