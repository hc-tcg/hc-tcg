import {createRequire} from 'module'
const require = createRequire(import.meta.url)

let config = null
try {
	config = require('../../server-config.json')
} catch {
	throw new Error('No server config found, using default values')
}
export const CONFIG = config

let debugConfig = {
	disableDeckValidation: false,
	extraStartingCards: [],
}

try {
	// @ts-ignore
	debugConfig = require('../../debug-config.json')
} catch {
	console.log('no debug config found, using default values')
}
export const DEBUG_CONFIG = debugConfig
