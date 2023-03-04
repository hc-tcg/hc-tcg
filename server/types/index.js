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
 * @property {string} censoredMessage
 * @property {string} playerId
 */

/**
 * @typedef {Object} Card
 * @property {string} cardId
 * @property {string} cardInstance
 */

/**
 * @typedef {Object} RowStateWithHermit
 * @property {Card} hermitCard
 * @property {Card | null} effectCard
 * @property {Array<Card|null>} itemCards
 * @property {number} health
 * @property {Array<Ailment>} ailments
 */

/**
 * @typedef {Object} RowStateWithoutHermit
 * @property {null} hermitCard
 * @property {null} effectCard
 * @property {Array<null>} itemCards
 * @property {null} health
 * @property {Array<Ailment>} ailments
 */

/**
 * @typedef {RowStateWithHermit | RowStateWithoutHermit} RowState
 */

/**
 * @typedef {Object} BoardState
 * @property {number | null} activeRow
 * @property {Card | null} singleUseCard
 * @property {boolean} singleUseCardUsed
 * @property {Array<RowState>} rows
 */

/**
 * @typedef {Object} PlayerState
 * @property {string} id
 * @property {string} playerName
 * @property {string} censoredPlayerName
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
 * @property {number | null} turnTime
 * @property {number | null} turnRemaining
 * @property {Object.<string, PlayerState>} players
 */

/**
 * @typedef {'END_TURN' | 'APPLY_EFFECT' | 'REMOVE_EFFECT' | 'ZERO_ATTACK' |
 *  'PRIMARY_ATTACK' | 'SECONDARY_ATTACK' | 'FOLLOW_UP' | 'WAIT_FOR_OPPONENT_FOLLOWUP' |
 *  'CHANGE_ACTIVE_HERMIT' | 'ADD_HERMIT' | 'PLAY_ITEM_CARD' | 'PLAY_SINGLE_USE_CARD' |
 *  'PLAY_EFFECT_CARD' | 'WAIT_FOR_TURN'} AvailableAction
 */

/**
 * @typedef {Array<AvailableAction>} AvailableActions
 */

/**
 * @typedef {Object} TurnAction
 * @property {Object} payload
 * @property {string} playerId
 */

/**
 * @typedef {Object} TurnState
 * @property {Array<AvailableAction>} availableActions
 * @property {Array<AvailableAction>} opponentAvailableActions
 * @property {Array<string>} pastTurnActions
 */

/**
 * @typedef {Object} ActionStateProperties
 * @property {Object} pickedCardsInfo
 * @typedef {TurnState & ActionStateProperties} ActionState
 */

/**
 * @typedef {Object} HermitDescriptor
 * @property {PlayerState} player
 * @property {RowStateWithHermit} row
 * @property {Card} hermitCard
 * @property {Object} hermitInfo
 */

/**
 * @typedef {Object} AttackStateProperties
 * @property {string} typeAction
 * @property {HermitDescriptor} attacker
 * @property {HermitDescriptor} moveRef
 * @property {HermitDescriptor} condRef
 * @typedef {ActionState & AttackStateProperties} AttackState
 */

/**
 * @typedef {Object} FollowUpStateProperties
 * @property {string} followUp
 * @typedef {ActionState & FollowUpStateProperties} FollowUpState
 */
