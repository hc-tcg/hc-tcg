/**
 * @typedef {import('common/types/game-state').CardT} CardT
 * @typedef {import('common/types/game-state').AvailableActionsT} AvailableActionsT
 * @typedef {import('common/types/game-state').PlayerState} PlayerState
 * @typedef {import('common/types/game-state').RowState} RowState
 * @typedef {import('common/types/game-state').RowStateWithHermit} RowStateWithHermit
 * @typedef {import('common/types/game-state').RowStateWithoutHermit} RowStateWithoutHermit
 * @typedef {import('common/types/cards').CardInfoT} CardInfoT
 * @typedef {import('common/types/cards').HermitCardT} HermitCardT
 * @typedef {import('common/types/pick-process').BoardPickedCardT} BoardPickedCardT
 * @typedef {import('common/types/pick-process').HandPickedCardT} HandPickedCardT
 */

/**
 * @typedef {Object} BoardPickedCardInfoProperties
 * @property {CardInfoT | null} cardInfo
 * @property {boolean} isActive
 * @property {RowStateWithHermit | RowStateWithoutHermit} row
 * @typedef {BoardPickedCardT & BoardPickedCardInfoProperties} BoardPickedCardInfo
 */

/**
 * @typedef {Object} HandPickedCardInfoProperties
 * @property {CardInfoT | null} cardInfo
 * @typedef {HandPickedCardT & HandPickedCardInfoProperties} HandPickedCardInfo
 */

/**
 * @typedef {BoardPickedCardInfo | HandPickedCardInfo} PickedCardInfo
 */

/**
 * @typedef {Record<string, Array<PickedCardInfo>>} PickedCardsInfo
 */

/**
 * @typedef {Object} TurnAction
 * @property {Object} payload
 * @property {string} playerId
 */

/**
 * @typedef {Object} TurnState
 * @property {AvailableActionsT} availableActions
 * @property {AvailableActionsT} opponentAvailableActions
 * @property {Array<string>} pastTurnActions
 */

/**
 * @typedef {Object} ActionStateProperties
 * @property {PickedCardsInfo} pickedCardsInfo
 * @typedef {TurnState & ActionStateProperties} ActionState
 */

/**
 * @typedef {Object} HermitDescriptor
 * @property {PlayerState} player
 * @property {RowStateWithHermit} row
 * @property {CardT} hermitCard
 * @property {HermitCardT} hermitInfo
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
 * @typedef {import('common/types/cards').InstanceInfo} InstanceInfo
 * @typedef {import('../models/game-model').GameModel} GameModel
 */
