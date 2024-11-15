import {DEBUG} from 'common/config'
import {Express} from 'express'
import root from 'serverRoot'
import {cards, deckCost, getDeckInformation, ranks, types} from './cards'
import {cancelApiGame, createApiGame, getGameCount, getGameInfo} from './games'
import {CancelGameBody} from './schema'
import {
	CardStatsQuery,
	DeckStatParams,
	StatsHeader,
	getCardStats,
	getDeckStats,
	getStats,
} from './stats'
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
		let query = CardStatsQuery.parse(req.params)
		res.send(
			await getCardStats({
				before: query.before || null,
				after: query.after || null,
			}),
		)
	})

	app.get('/api/hof/decks', async (req, res) => {
		let query = DeckStatParams.parse(req.params)
		res.send(
			await getDeckStats({
				before: query.before || null,
				after: query.after || null,
				offset: query.offset || null,
				orderBy: query.orderBy || null,
				minimumWins: query.minimumWins || null,
			}),
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
