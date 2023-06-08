// TODO - You can "apply effect" by putting it on in the slot, then selecting another clicking the slotteded one and confirmiing modal

import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils'

/**
 *
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {ActionState} actionState
 * @returns
 */
function* applyEffectSaga(game, turnAction, actionState) {
	const {pickedSlots} = actionState

	const result = applySingleUse(game, pickedSlots)
	if (!result) return 'INVALID'
}

export default applyEffectSaga
