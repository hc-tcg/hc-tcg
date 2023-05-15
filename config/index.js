import config from './server-config.json' assert {type: 'json'}
import debugConfig from './debug-config.json' assert {type: 'json'}
import ranks from './ranks.json' assert {type: 'json'}

/**
 * @typedef {import('common/types/cards').CardInfoT} CardInfoT
 */

export const CONFIG = config
export const DEBUG_CONFIG = debugConfig
export const RANKS = ranks
