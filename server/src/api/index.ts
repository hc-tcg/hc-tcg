import {Express} from 'express'
import root from 'serverRoot'
import {cards, deckCost, getCardsInDeck} from './cards'
import {createApiGame, cancelApiGame} from './games'
import {requestUrlRoot} from './utils'
import {CancelGameBody} from './schema'

export function addApi(app: Express) {
	app.get('/api/cards', (req, res) => {
		res.send(cards(requestUrlRoot(req)))
	})

	app.get('/api/deck/:deck', (req, res) => {
		res.send(getCardsInDeck(requestUrlRoot(req), req.params.deck))
	})

	app.post('/api/deck/cost', (req, res) => {
		res.send(deckCost(req.body))
	})

	app.get('/api/games/create', (_req, res) => {
		res.send(createApiGame())
	})

	app.delete('/api/games/cancel', (req, res) => {
		let body = CancelGameBody.parse(req.body)
		res.send(cancelApiGame(body.code))
	})

	if (process.env.NODE_ENV !== 'production') {
		app.get('/debug/root-state/queue', (_req, res) => {
			res.send(root.queue)
		})
	}
}
