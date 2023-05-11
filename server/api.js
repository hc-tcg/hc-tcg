import {createRequire} from 'module'
const require = createRequire(import.meta.url)
import root from './models/root-model'

/**
 * @param {import("express").Express} app
 */
export function registerApis(app) {
	const apiKeys = require('./apiKeys.json')
	app.get('/games', (req, res) => {
		const apiKey = req.header('api-key')
		if (apiKey) {
			if (apiKeys.keys.includes(apiKey)) {
				res.status(201).send(root.getGames())
			} else {
				res.status(403).send('Access denied - Invalid API key')
			}
		} else {
			res.status(403).send('Access denied - Please provide an api key')
		}
	})
}
