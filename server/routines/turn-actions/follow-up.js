import {GameModel} from '../../models/game-model'

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
		const followUpHooks = Object.values(player.hooks.onFollowUp)
		for (let i = 0; i < followUpHooks.length; i++) {
			for (const followUp of Object.keys(player.followUp)) {
				followUpHooks[i](followUp, pickedSlots, modalResult)
			}
		}
	}
}

export default followUpSaga
