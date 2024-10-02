let debugConfig = {}
let config = {}
let profanitySeed = {}

// This is a hack so playwright can build the project during tests.
try {
	debugConfig = require('./debug-config.json')
	config = require('./server-config.json')
	profanitySeed = require('./profanity-seed.json')
} catch {}

// __APP_VERSION__ is defined in vite.config.js and esbuild.js.
declare const __APP_VERSION__: string
let appVersion
try {
	appVersion = __APP_VERSION__
} catch {
	// We are running with tsx, so __APP_VERSION__ was not set.
	appVersion = 'unknown'
}
// __DEBUG_BUILD__ is defined in vite.config.js and esbuild.js
declare const __DEBUG_BUILD__: string
let debug
try {
	debug = __DEBUG_BUILD__
} catch {
	debug = true
}

export const VERSION = appVersion
/** Set to 'true` if the server or client is being run in the development or CI environment. */
export const DEBUG = debug

export const CONFIG = config
export const DEBUG_CONFIG = debugConfig

export const PROFANITY_SEED = profanitySeed
