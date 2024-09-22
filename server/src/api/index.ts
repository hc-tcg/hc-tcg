import {Express} from 'express'
import {cards, getCardsInDeck} from './cards'
import {requestUrlRoot} from './utils'

export function addApi(app: Express) {
	app.get('/api/cards', (req, res) => {
		res.send(cards(requestUrlRoot(req)))
	})
	app.get('/api/deck/:deck', (req, res) => {
		res.send(getCardsInDeck(requestUrlRoot(req), req.params.deck))
	})
}
