export const BASE_URL =
	__ENV__ === 'development'
		? `${window.location.protocol}//${window.location.hostname}:${__PORT__}`
		: window.location.protocol + '//' + window.location.host
