import io from 'socket.io-client'

const socket = io('http://localhost:9000')

socket.on('connect', () => {
	console.log('Connected to websockets')
})

socket.on('disconnect', () => {
	// TODO - Both disconnect & error event might be triggered on disconnect
	console.log('Disconnected from websockets.')
})

socket.on('error', (error) => {
	console.log('Socket error: ', error)
})

export default socket
