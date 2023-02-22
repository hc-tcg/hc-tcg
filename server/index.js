import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'
import {createServer} from 'http'
import cors from 'cors'
import {Server} from 'socket.io'
import store from './be-store'
import playerSockets from './be-socket'
import './cards'
import config from '../server-config.json' assert {type: 'json'}

const port = process.env.PORT || config.port || 9000

const app = express()
app.use(
	cors({
		origins: config.cors,
	})
)

const server = createServer(app)
const io = new Server(server, {
	cors: {
		origin: config.cors,
		methods: ['GET', 'POST'],
	},
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(
	express.static(path.join(__dirname, '..', config.clientPath), {
		maxAge: 1000 * 60 * 60,
	})
)

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', config.clientPath, 'index.html'))
})

const isValidName = (name) => {
	if (typeof name !== 'string') return false
	if (name.length < 1) return false
	if (name.length > 25) return false
	return true
}

io.on('connection', (socket) => {
	// TODO - use playerSecret to verify requests
	// TODO - Validate json of all requests
	const playerName = socket.handshake.auth?.playerName || ''
	if (!isValidName(playerName)) {
		console.log('Invalid player name: ', playerName)
		return socket.disconnect(true)
	}
	store.dispatch({
		type: 'CLIENT_CONNECTED',
		payload: {socket, ...socket.handshake.auth},
	})
	socket.onAny((event, message) => {
		// console.log('[received] ', event, ': ', message)
		if (!message.type) return
		store.dispatch({...message, socket})
	})
	socket.on('disconnect', () => {
		store.dispatch({
			type: 'CLIENT_DISCONNECTED',
			payload: {socket},
		})
	})
})

server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
