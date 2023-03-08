// @TODO need more info about types

/*
 * @typedef {Object} Ailment
 * @property {'poison' | 'fire' | 'sleeping' | 'knockedout'} id
 * @property {number} duration
 */

/**
 * @typedef {import('common/types/game-state').CardT} CardT
 * @typedef {import('common/types/game-state').AvailableActionsT} AvailableActionsT
 * @typedef {import('common/types/game-state').PlayerState} PlayerState
 * @typedef {import('common/types/game-state').RowState} RowState
 * @typedef {import('common/types/game-state').RowStateWithHermit} RowStateWithHermit
 * @typedef {import('common/types/cards').CardInfoT} CardInfoT
 * @typedef {import('common/types/cards').HermitCardT} HermitCardT
 * @typedef {import('common/types/pick-process').BoardPickedCardT} BoardPickedCardT
 * @typedef {import('common/types/pick-process').HandPickedCardT} HandPickedCardT
 */

/**
 * @typedef {Object} BoardPickedCardInfoProperties
 * @property {CardInfoT | null} cardInfo
 * @property {boolean} isActive
 * @property {RowStateWithHermit} row
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
