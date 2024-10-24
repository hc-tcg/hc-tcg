import 'dotenv/config'
import {createServer} from 'http'
import path from 'path'
import {fileURLToPath} from 'url'
import {CARDS_LIST} from 'common/cards'
import {CONFIG} from 'common/config'
import cors from 'cors'
import express from 'express'
import {Database, setupDatabase} from '../src/db/db'
import {addApi} from './api'
import startSocketIO from './sockets'

const port = process.env.PORT || CONFIG.port || 9000

const app = express()
app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const server = createServer(app)

startSocketIO(server)

app.use(express.json())
app.use(cors({origin: CONFIG.cors}))

// @TODO Hardcoded redirect to the new site, for now
app.use((req, res, next) => {
	if (req.hostname === 'hc-tcg.fly.dev') {
		res.redirect(301, 'https://hc-tcg.online')
	} else {
		next()
	}
})

app.use(
	express.static(path.join(__dirname, '../..', CONFIG.clientPath), {
		maxAge: 1000 * 60 * 60,
	}),
)

app.get('/', (_req, res) => {
	res.sendFile(path.join(__dirname, '../..', CONFIG.clientPath, 'index.html'))
})

addApi(app)

server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})

export const pgDatabase: Database = setupDatabase(CARDS_LIST, process.env, 8)
