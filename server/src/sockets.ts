import {CONFIG} from 'common/config'
import {LocalMessage, localMessages} from 'messages'
import {Server} from 'socket.io'
import store from './be-store'
import version from './version'

const isValidName = (name: string) => {
	if (name.length < 1) return false
	if (name.length > 25) return false
	return true
}

const env = process.env.NODE_ENV || 'development'
const isValidVersion = (clientVersion: string) => {
	if (env === 'development') {
		return true
	}
	return version === clientVersion
}

function startSocketIO(server: any) {
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

		store.dispatch<LocalMessage>({
			type: localMessages.CLIENT_CONNECTED,
			socket,
			...socket.handshake.auth,
		})
		socket.onAny((_event, message) => {
			if (!message?.type) return
			store.dispatch({...message, socket})
		})
		socket.on('disconnect', () => {
			store.dispatch({
				type: localMessages.CLIENT_DISCONNECTED,
				socket,
			})
		})
	})
}

export default startSocketIO
