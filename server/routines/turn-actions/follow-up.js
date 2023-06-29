import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {runAllAttacks} from './attack.js'

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {ActionState} actionState
 */
function* followUpSaga(game, turnAction, actionState) {
	const {currentPlayer, opponentPlayer} = game.ds
	const {pickedSlots, modalResult} = actionState
	for (const player of [currentPlayer, opponentPlayer]) {
		if (Object.keys(player.followUp).length === 0) continue
		/** @type {Array<AttackModel>} */
		const newAttacks = []
		const followUpHooks = Object.values(player.hooks.onFollowUp)
		for (let i = 0; i < followUpHooks.length; i++) {
			for (const followUp of Object.keys(player.followUp)) {
				followUpHooks[i](followUp, pickedSlots, modalResult, newAttacks)
			}

			if (newAttacks.length > 0) {
				runAllAttacks(newAttacks)
			}
		}
	}
}

export default followUpSaga
