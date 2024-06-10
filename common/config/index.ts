import config from './server-config.json'
import debugConfig from './debug-config.json'
import ranks from './ranks.json'
import expansions from './expansions.json'

// __VERSION__ is defined in vite.config.js and esbuild.config.js
declare const __VERSION__: string
export let VERSION: string = 'Unknown Version'
try {
	VERSION = __VERSION__
} catch {
	VERSION = 'Unknown Version'
}

export const CONFIG = config
export const DEBUG_CONFIG = debugConfig
export const RANKS = ranks
export const EXPANSIONS = expansions
