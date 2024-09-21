import {Express} from 'express'
import {cards, getCardsInDeck} from './cards'

export function addApi(app: Express) {
	app.get('/api/cards', (_req, res) => {
		res.send(cards())
	})
	app.get('/api/deck/:deck', (req, res) => {
		res.send(getCardsInDeck(req.params.deck))
	})
}
