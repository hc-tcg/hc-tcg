import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'
import {createServer} from 'http'
import cors from 'cors'
import {Server} from 'socket.io'
import store from './be-store'
import playerSockets from './be-socket'
import './cards'

const app = express()
app.use(
	cors({
		origins: ['http://localhost:3002'],
	})
)

const server = createServer(app)
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3002',
		methods: ['GET', 'POST'],
	},
})
const port = 9000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'build')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

io.on('connection', (socket) => {
	console.log('a user connected')
	socket.onAny((event, message) => {
		console.log('[received] ', event, ': ', message)
		if (!message.type) return
		store.dispatch({...message, socket})
	})
})

server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
