import config from './server-config.json'
import ranks from './ranks.json'
import expansions from './expansions.json'
import {createRequire} from 'module'

function getDebugConfig() {
	const require = createRequire(import.meta.url)
	try {
		return require('./debug-config.json')
	} catch {
		return {}
	}
}

export const CONFIG = config
export const DEBUG_CONFIG = getDebugConfig()
export const RANKS = ranks
export const EXPANSIONS = expansions
