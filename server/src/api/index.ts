import {Express} from 'express'
import {cards, deckCost, getCardsInDeck} from './cards'
import {requestUrlRoot} from './utils'
import root from 'serverRoot'

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

	if (process.env.NODE_ENV !== 'production') {
		app.get('/debug/root-state/queue', (_req, res) => {
			res.send(root.queue)
		})
	}
}
