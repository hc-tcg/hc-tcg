import {Express} from 'express'
import {cards} from './cards'

export function addApi(app: Express) {
	app.get('/api/cards', (_req, res) => {
		res.send(cards())
	})
}
