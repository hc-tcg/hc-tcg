import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'
import {createServer} from 'http'
import cors from 'cors'
import './cards'
import {CONFIG} from '../config'
import startSocketIO from './sockets'
import {registerApis} from './api'

const port = process.env.PORT || CONFIG.port || 9000

const app = express()
app.use(express.json())
app.use(cors({origin: CONFIG.cors}))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(
	express.static(path.join(__dirname, '..', CONFIG.clientPath), {
		maxAge: 1000 * 60 * 60,
	})
)

app.get('/', (req, res) => {
	console.log('1')
	res.sendFile(path.join(__dirname, '..', CONFIG.clientPath, 'index.html'))
})

registerApis(app)

const server = createServer(app)

startSocketIO(server)

server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
