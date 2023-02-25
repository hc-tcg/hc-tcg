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

/**
 * @typedef {Object} BoardState
 * @property {number | null} activeRow
 * @property {Card | null} singleUseCard
 * @property {boolean} singleUseCardUsed
 * @property {Array<RowState>} rows
 */

// @TODO if cards could access game.players, then we wouldn't need to duplicate info like playerName here
// --> or maybe playerState could just contain a reference to the Player instance? <--
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

/**
 * @typedef {'END_TURN' | 'APPLY_EFFECT' | 'REMOVE_EFFECT' | 'ZERO_ATTACK' |
 *  'PRIMARY_ATTACK' | 'SECONDARY_ATTACK' | 'FOLLOW_UP' | 'WAIT_FOR_OPPONENT_FOLLOWUP' |
 *  'CHANGE_ACTIVE_HERMIT' | 'ADD_HERMIT' | 'PLAY_ITEM_CARD' | 'PLAY_SINGLE_USE_CARD' | 'PLAY_EFFECT_CARD'} AvailableAction
 */

/**
 * @typedef {Array<AvailableAction>} AvailableActions
 */

/**
 * @typedef {Object} TurnAction
 * @property {Object} payload
 * @property {string} playerId
 */
