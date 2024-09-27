import {DEBUG} from 'common/config'
import {Express} from 'express'
import root from 'serverRoot'
import {cards, deckCost, getCardsInDeck} from './cards'
import {cancelApiGame, createApiGame} from './games'
import {CancelGameBody} from './schema'
import {requestUrlRoot} from './utils'

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

	if (DEBUG) {
		app.get('/debug/root-state/queue', (_req, res) => {
			res.send(root.queue)
		})
	}
}
