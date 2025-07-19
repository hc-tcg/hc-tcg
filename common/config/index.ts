import profanitySeed from './profanity-seed.js'
import CONFIG_T from '../../config.example.js'

let config = null
try {
	config = await import('../../config.js')
} catch {
	config = await import('../../config.example.js')
}

console.log(config)

// __APP_VERSION__ is defined in vite.config.js and esbuild.js.
declare const __APP_VERSION__: string
let appVersion
try {
	appVersion = __APP_VERSION__
} catch {
	// We are running with tsx, so __APP_VERSION__ was not set.
	appVersion = undefined
}
// __DEBUG_BUILD__ is defined in vite.config.js and esbuild.js
declare const __DEBUG_BUILD__: boolean
let debug = false
try {
	debug = __DEBUG_BUILD__
} catch {
	debug = true
}

export const VERSION = appVersion
/** Set to 'true` if the server or client is being run in the development or CI environment. */
export const DEBUG = debug

export const CONFIG: typeof CONFIG_T = config.default

export const PROFANITY_SEED = profanitySeed
