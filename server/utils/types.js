// @TODO need more info about types

/**
 * @typedef {Object} Ailment
 * @property {'poison' | 'fire' | 'sleeping' | 'knockedout'} id
 * @property {number} duration
 */

/**
 * @typedef {Object} ChatMessage
 * @property {number} createdAt
 * @property {string} message
 * @property {string} playerId
 */

/**
 * @typedef {Object} Card
 * @property {string} cardId
 * @property {string} cardInstance
 */

/**
 * @typedef {Object} RowState
 * @property {Card | null} hermitCard
 * @property {Card | null} effectCard
 * @property {Array<Card>} itemCards
 * @property {number | null} health
 * @property {Array<Ailment>} ailments
 */

// @TODO finish PlayerBoard typedef

/**
 * @typedef {Object} BoardState
 * @property {number | null} activeRow
 * @property {Card | null} singleUseCard
 * @property {boolean} singleUseCardUsed
 * @property {Array<RowState>} rows
 */

// @TODO once all cards have been refactored to have access to the game object a lot of this doesn't need to be stored here
/**
 * @typedef {Object} PlayerState
 * @property {string} id
 * @property {string} playerName
 * @property {*} coinFlips
 * @property {*} followUp
 * @property {number} lives
 * @property {Array<*>} hand
 * @property {Array<*>} rewards
 * @property {Array<*>} discarded
 * @property {Array<*>} pile
 * @property {*} custom
 * @property {BoardState} board
 */

/**
 * @typedef {Object} GameState
 * @property {number} turn
 * @property {Array<string>} order
 * @property {string | null} turnPlayerId
 * @property {Object.<string, PlayerState>} players
 */
