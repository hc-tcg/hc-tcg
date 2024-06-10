import config from './server-config.json'
import debugConfig from './debug-config.json'
import ranks from './ranks.json'
import expansions from './expansions.json'

// __VERSION__ is defined in vite.config.js and esbuild.config.js
declare const __APP_VERSION__: string
export const VERSION = __APP_VERSION__

export const CONFIG = config
export const DEBUG_CONFIG = debugConfig
export const RANKS = ranks
export const EXPANSIONS = expansions
