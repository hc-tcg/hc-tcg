import {Server} from 'socket.io'
import config from '../server-config.json' assert {type: 'json'}
import store from './be-store'

const isValidName = (name) => {
	if (typeof name !== 'string') return false
	if (name.length < 1) return false
	if (name.length > 25) return false
	return true
}

function startSocketIO(server) {
	const io = new Server(server, {
		cors: {
			origin: config.cors,
			methods: ['GET', 'POST'],
		},
	})

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
}

export default startSocketIO
