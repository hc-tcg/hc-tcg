/**
 * @typedef {import('common/types/game-state').CardT} CardT
 * @typedef {import('common/types/game-state').AvailableActionsT} AvailableActionsT
 * @typedef {import('common/types/game-state').PlayerState} PlayerState
 * @typedef {import('common/types/game-state').RowState} RowState
 * @typedef {import('common/types/game-state').RowStateWithHermit} RowStateWithHermit
 * @typedef {import('common/types/game-state').RowStateWithoutHermit} RowStateWithoutHermit
 * @typedef {import('common/cards/card-plugins/hermits/_hermit-card')} HermitCard
 */

/**
 * @typedef {Object} TurnAction
 * @property {Object} payload
 * @property {string} playerId
 * @property {string} type
 */

/**
 * @typedef {Object} TurnState
 * @property {AvailableActionsT} availableActions
 * @property {AvailableActionsT} opponentAvailableActions
 * @property {Array<string>} pastTurnActions
 */

/**
 * @typedef {Object} ActionStateProperties
 * @property {import('common/types/pick-process').PickedSlots} pickedSlots
 * @property {*} modalResult
 * @typedef {TurnState & ActionStateProperties} ActionState
 */

/**
 * @typedef {Object} HermitDescriptor
 * @property {PlayerState} player
 * @property {RowStateWithHermit} row
 * @property {CardT} hermitCard
 * @property {HermitCard} hermitInfo
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

/**
 * @typedef {Object} AttackRecovery
 * @property {number} amount
 * @property {boolean} [discardEffect]
 */

/**
 * @typedef {Object} AttackTarget
 * @property {RowStateWithHermit} row no
 * @property {boolean} applyHermitDamage no
 * @property {string|null} effectCardId no
 * @property {boolean} isActive no
 * @property {number} extraEffectDamage no
 * @property {boolean} hasWeakness
 * @property {number} extraHermitDamage
 * @property {boolean} invulnarable
 * @property {Array<AttackRecovery>} recovery
 * @property {boolean} ignoreEffects
 * @property {boolean} additionalAttack
 * @property {boolean} ignoreRecovery
 * @property {boolean} reverseDamage no
 * @property {number} backlash
 * @property {number} hermitMultiplier no
 * @property {number} effectMultiplier no
 */

/**
 * @typedef {Object} AttackTargetResult
 * @property {RowStateWithHermit} row
 * @property {number} totalDamage
 * @property {number} finalDamage
 * @property {number} totalDamageToAttacker
 * @property {number} finalDamageToAttacker
 * @property {boolean} revived
 * @property {boolean} died
 */

/**
 * @typedef {import('common/types/cards').CardTypeT} CardTypeT
 */
