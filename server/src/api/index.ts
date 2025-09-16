import {DEBUG} from 'common/config'
import {NumberOrNull} from 'common/utils/database-codes'
import {Express} from 'express'
import root from 'serverRoot'
import {
	PlayerAchievementProgressQuery,
	achievements,
	overallAchievementProgress,
	playerProgress,
} from './achievements'
import {
	ApiKeyHeader,
	authenticateApiKey,
	authenticateUser,
	createUser,
	resetSecret,
} from './auth'
import {cards, deckCost, getDeckInformation, ranks, types} from './cards'
import {
	cancelApiGame,
	createApiGame,
	getGameInfo,
	getPublicGameCount,
	getPublicQueueLength,
} from './games'
import {CancelGameBody} from './schema'
import {
	BasicStatsQuery,
	CardStatsQuery,
	DeckStatQuery,
	StatsQueryParams,
	getCardStats,
	getDeckStats,
	getGamesStats,
	getPrivateGame,
	getStats,
	getTypeDistributionStats,
} from './stats'
import {UpdateMessage, updateWarning} from './update-warning'
import {requestUrlRoot} from './utils'

export function addApi(app: Express) {
	app.get('/api/auth/', async (req, res) => {
		const userId = req.get('userId')
		const secret = req.get('secret')
		let ret = await authenticateUser(userId, secret)
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.post('/api/createUser/', async (req, res) => {
		const username = req.get('username')
		let ret = await createUser(username)
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/resetSecret/', async (req, res) => {
		const userId = req.get('userId')
		const secret = req.get('secret')
		let ret = await resetSecret(userId, secret)
		res.statusCode = ret[0]
		res.send(ret[1])
	})

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
		let ret = await getDeckInformation(requestUrlRoot(req), req.params.deck)
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.post('/api/deck/cost', async (req, res) => {
		res.send(deckCost(req.body))
	})

	app.get('/api/games/count', (_req, res) => {
		res.send(getPublicGameCount())
	})

	app.get('/api/games/create', (req, res) => {
		res.send(createApiGame(requestUrlRoot(req)))
	})

	app.get('/api/games/queue/length', (_req, res) => {
		res.send(getPublicQueueLength())
	})

	app.delete('/api/games/cancel', (req, res) => {
		let body = CancelGameBody.parse(req.body)
		let ret = cancelApiGame(body.code)
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/games/:secret', (req, res) => {
		res.send(getGameInfo(req.params.secret))
	})

	app.get('/api/stats', async (req, res) => {
		let params = StatsQueryParams.parse(req.query)
		console.log(params)
		let ret = await getStats(root.db, params.uuid)
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/stats/cards', async (req, res) => {
		let query = CardStatsQuery.parse(req.query)
		let ret = await getCardStats({
			before: NumberOrNull(query.before),
			after: NumberOrNull(query.after),
			orderBy: query.orderBy || null,
		})
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/stats/decks', async (req, res) => {
		let query = DeckStatQuery.parse(req.query)
		let ret = await getDeckStats({
			before: NumberOrNull(query.before),
			after: NumberOrNull(query.after),
			offset: NumberOrNull(query.offset),
			orderBy: query.orderBy || null,
			minimumWins: NumberOrNull(query.minimumWins),
		})
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/stats/type-distribution', async (req, res) => {
		let query = BasicStatsQuery.parse(req.query)
		let ret = await getTypeDistributionStats({
			before: NumberOrNull(query.before),
			after: NumberOrNull(query.after),
		})
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/stats/games', async (req, res) => {
		let query = BasicStatsQuery.parse(req.query)
		let ret = await getGamesStats({
			before: NumberOrNull(query.before),
			after: NumberOrNull(query.after),
		})
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/stats/private-game/:code', async (req, res) => {
		let ret = await getPrivateGame({
			opponentCode: req.params.code,
		})
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.get('/api/achievements', async (req, res) => {
		res.send(achievements(requestUrlRoot(req)))
	})

	app.get('/api/achievements/player-progress', async (req, res) => {
		const query = PlayerAchievementProgressQuery.parse(req.query)
		if (!query.achievementId || !query.uuid) {
			res.statusCode = 400
			res.send({reason: 'Must pass achievementId and uuid.'})
			return
		}
		const ret = await playerProgress(query.achievementId, query.uuid)
		res.statusCode = ret[0]
		res.send(ret[1])
	})

	app.post('/api/update', async (req, res) => {
		let auth = ApiKeyHeader.parse(req.headers)
		await authenticateApiKey(auth.auth)
		updateWarning(UpdateMessage.parse(req.body).version)
		res.statusCode = 200
		res.send('success')
	})

	app.get('/api/achievements/:achievement/:level', async (req, res) => {
		const ret = await overallAchievementProgress(
			req.params.achievement,
			NumberOrNull(req.params.level) || 0,
		)
		res.statusCode = ret[0]
		res.send(ret[1])
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
