import {GameModel} from '../../models/game-model'

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {ActionState} actionState
 */
function* followUpSaga(game, turnAction, actionState) {
	const followUpPlayer = game.state.players[turnAction.playerId]
	if (!followUpPlayer || !followUpPlayer.followUp) return

	const followUpHooks = Object.values(followUpPlayer.hooks.onFollowUp)
	for (let i = 0; i < followUpHooks.length; i++) {
		followUpHooks[i](followUpPlayer.followUp, actionState.pickedSlots)
	}
}

export default followUpSaga
