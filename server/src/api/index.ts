import {DEBUG} from 'common/config'
import {Express} from 'express'
import root from 'serverRoot'
import {
	cards,
	deckCost,
	getCardStats,
	getDeckInformation,
	getDeckStats,
	ranks,
	types,
} from './cards'
import {cancelApiGame, createApiGame, getGameCount, getGameInfo} from './games'
import {CancelGameBody} from './schema'
import {StatsHeader, getStats} from './stats'
import {requestUrlRoot} from './utils'

export function addApi(app: Express) {
	app.get('/api/cards', (req, res) => {
		res.send(cards(requestUrlRoot(req)))
	})

	app.get('/api/types', (req, res) => {
		res.send(types(requestUrlRoot(req)))
	})

	app.get('/api/ranks', (req, res) => {
		res.send(ranks(requestUrlRoot(req)))
	})

	app.get('/api/deck/:deck', async (req, res) => {
		res.send(await getDeckInformation(requestUrlRoot(req), req.params.deck))
	})

	app.post('/api/deck/cost', async (req, res) => {
		res.send(await deckCost(req.body))
	})

	app.get('/api/games/count', (_req, res) => {
		res.send(getGameCount())
	})

	app.get('/api/games/create', (_req, res) => {
		res.send(createApiGame())
	})

	app.delete('/api/games/cancel', (req, res) => {
		let body = CancelGameBody.parse(req.body)
		res.send(cancelApiGame(body.code))
	})

	app.get('/api/games/:secret', (req, res) => {
		res.send(getGameInfo(req.params.secret))
	})

	app.get('/api/stats', async (req, res) => {
		let header = StatsHeader.parse(req.headers)
		res.send(await getStats(root.db, header))
	})

	app.get('/api/hof/cards', async (req, res) => {
		const before = req.query.before ? Number(req.query.before) : null
		const after = req.query.after ? Number(req.query.after) : null

		res.send(await getCardStats(requestUrlRoot(req), before, after))
	})

	app.get('/api/hof/decks', async (req, res) => {
		const before = req.query.before ? Number(req.query.before) : null
		const after = req.query.after ? Number(req.query.after) : null
		const offset = req.query.offset ? Number(req.query.offset) : null
		const orderBy =
			req.query.orderBy === 'wins' || req.query.orderBy === 'winrate'
				? req.query.orderBy
				: null
		const minimumWins = req.query.minimumWins
			? Number(req.query.minimumWins)
			: null

		res.send(
			await getDeckStats(
				requestUrlRoot(req),
				before,
				after,
				offset,
				orderBy,
				minimumWins,
			),
		)
	})

	if (DEBUG) {
		app.get('/debug/root-state/queue', (_req, res) => {
			res.send(root.queue)
		})
		app.get('/debug/root-state/private-queue/:apiSecret', (req, res) => {
			res.send(
				Object.values(root.privateQueue).find(
					(q) => q.apiSecret === req.params.apiSecret,
				),
			)
		})
	}
}
