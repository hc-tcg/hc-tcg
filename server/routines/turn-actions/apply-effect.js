// TODO - You can "apply effect" by putting it on in the slot, then selecting another clicking the slotteded one and confirmiing modal

import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils'

/**
 *
 * @param {GameModel} game
 * @param {*} turnAction
 * @param {*} actionState
 * @returns
 */
function* applyEffectSaga(game, turnAction, actionState) {
	const {pickedSlotsInfo} = actionState

	const result = applySingleUse(game, pickedSlotsInfo)
	if (!result) return 'INVALID'
}

export default applyEffectSaga
