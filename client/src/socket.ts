import io from 'socket.io-client'

const url =
	window.location.hostname === 'localhost'
		? 'http://localhost:9000'
		: window.location.protocol + '//' + window.location.host

const socket = io(url, {autoConnect: false})

socket.on('error', (error) => {
	console.log('Socket error: ', error)
})

socket.onAny((event, payload) => {
	console.log('[message]', event, payload)
})

export default socket
