import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'
import {createServer} from 'http'
import cors from 'cors'
import './cards'
import config from '../server-config.json' assert {type: 'json'}
import startSocketIO from './sockets'

const port = process.env.PORT || config.port || 9000

const app = express()
app.use(cors({origins: config.cors}))

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

const server = createServer(app)

startSocketIO(server)

server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
