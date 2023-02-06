import io from 'socket.io-client'

const socket = io('http://localhost:9000', {
	autoConnect: false,
})

socket.on('error', (error) => {
	console.log('Socket error: ', error)
})

socket.onAny((event, payload) => {
	console.log('[message]', event, payload)
})

export default socket
