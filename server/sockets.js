import {Server} from 'socket.io'
import {CONFIG} from '../config'
import store from './be-store'
import version from './version'

const isValidName = (name) => {
	if (typeof name !== 'string') return false
	if (name.length < 1) return false
	if (name.length > 25) return false
	return true
}

const env = process.env.NODE_ENV || 'development'
const isValidVersion = (clientVersion) => {
	if (env === 'development') {
		return true
	}
	return version === clientVersion
}

function startSocketIO(server) {
	const io = new Server(server, {
		cors: {
			origin: CONFIG.cors,
			methods: ['GET', 'POST'],
		},
	})

	io.use((socket, next) => {
		const playerName = socket.handshake.auth?.playerName || ''
		const clientVersion = socket.handshake.auth?.version || ''
		if (!isValidName(playerName)) {
			console.log('Invalid player name: ', playerName)
			return next(new Error('invalid_name'))
		}
		if (!isValidVersion(clientVersion)) {
			console.log('Invalid version: ', clientVersion)
			return next(new Error('invalid_version'))
		}
		next()
	})

	io.on('connection', (socket) => {
		// TODO - use playerSecret to verify requests
		// TODO - Validate json of all requests

		store.dispatch({
			type: 'CLIENT_CONNECTED',
			payload: {socket, ...socket.handshake.auth},
		})
		socket.onAny((event, message) => {
			// console.log('[received] ', event, ': ', message)
			if (!message?.type) return
			store.dispatch({...message, socket})
		})
		socket.on('disconnect', () => {
			store.dispatch({
				type: 'CLIENT_DISCONNECTED',
				payload: {socket},
			})
		})
	})
}

export default startSocketIO
