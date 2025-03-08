import 'dotenv/config'
import {createServer} from 'http'
import path from 'path'
import {fileURLToPath} from 'url'
import {CONFIG} from 'common/config'
import cors from 'cors'
import express from 'express'
import root from 'serverRoot'
import {addApi} from './api'
import {loadUpdates} from './load-updates'
import startSocketIO from './sockets'
import {rateLimit} from 'express-rate-limit'

const port = process.env.PORT || CONFIG.port || 9000

const app = express()
app.use(express.json())

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8',
	legacyHeaders: false,
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

const authLimiter = rateLimit({
	windowMs: 30 * 1000,
	limit: 1,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
})

// Apply the rate limiting middleware to all requests.
app.use('/auth', authLimiter)

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

loadUpdates().then((updates) => {
	if (!updates) return
	root.updates = updates
})
