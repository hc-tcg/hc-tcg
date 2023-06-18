import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {runAttackLoop} from './attack'

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {ActionState} actionState
 */
function* followUpSaga(game, turnAction, actionState) {
	const {pickedSlots, modalResult} = actionState
	const followUpPlayer = game.state.players[turnAction.playerId]
	if (!followUpPlayer || !followUpPlayer.followUp) return

	/** @type {Array<AttackModel>} */
	const newAttacks = []
	const followUpHooks = Object.values(followUpPlayer.hooks.onFollowUp)
	for (let i = 0; i < followUpHooks.length; i++) {
		followUpHooks[i](followUpPlayer.followUp, pickedSlots, modalResult)
	}
}

export default followUpSaga
