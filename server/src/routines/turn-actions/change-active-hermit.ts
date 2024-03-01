import {GameModel} from 'common/models/game-model'
import {ChangeActiveHermitActionData} from 'common/types/action-data'
import {GenericActionResult} from 'common/types/game-state'
import {call} from 'typed-redux-saga'

function* changeActiveHermit(
	game: GameModel,
	turnAction: ChangeActiveHermitActionData
): Generator<any, GenericActionResult> {
	const {currentPlayer} = game

	// Find the row we are trying to change to
	const rowIndex = turnAction?.payload?.pickInfo?.rowIndex
	if (rowIndex === undefined) return 'FAILURE_INVALID_DATA'
	if (turnAction.payload.pickInfo.playerId !== currentPlayer.id) {
		return 'FAILURE_CANNOT_COMPLETE'
	}

	const hadActiveHermit = currentPlayer.board.activeRow !== null

	// Change row
	const result = game.changeActiveRow(currentPlayer, rowIndex)
	if (!result) return 'FAILURE_CANNOT_COMPLETE'

	if (hadActiveHermit) {
		// We switched from one hermit to another, mark this action as completed
		game.addCompletedActions('CHANGE_ACTIVE_HERMIT')

		// Attack phase complete, mark most actions as blocked now
		game.addBlockedActions(
			null,
			'SINGLE_USE_ATTACK',
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD'
		)
	}

	return 'SUCCESS'
}

export default changeActiveHermit
