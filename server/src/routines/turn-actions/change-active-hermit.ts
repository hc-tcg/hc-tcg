import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import {equalCard} from 'common/utils/cards'

function* changeActiveHermit(
	game: GameModel,
	turnAction: any
): Generator<never, GenericActionResult> {
	const {currentPlayer} = game

	// Find the row we are trying to change to
	const rowHermitCard = turnAction?.payload?.row?.state?.hermitCard
	const rowIndex = currentPlayer.board.rows.findIndex((row) => {
		return equalCard(row.hermitCard, rowHermitCard)
	})
	if (rowIndex === -1) return 'FAILURE_INVALID_DATA'
	const row = currentPlayer.board.rows[rowIndex]

	// Can't change to existing active row
	if (rowIndex === currentPlayer.board.activeRow) return 'FAILURE_CANNOT_COMPLETE'

	// Can't change to knocked out if we have other hermits
	const isKnockedout = !!row.ailments.find((a) => a.id === 'knockedout')
	const hasOtherHermits = currentPlayer.board.rows.some((row, index) => {
		return !!row.hermitCard && index !== rowIndex
	})
	if (isKnockedout && hasOtherHermits) return 'FAILURE_CANNOT_COMPLETE'

	const hadActiveHermit = currentPlayer.board.activeRow !== null
	const oldActiveRow = currentPlayer.board.activeRow

	// Actually change row
	currentPlayer.board.activeRow = rowIndex

	if (hadActiveHermit) {
		// We switched from one hermit to another, mark this action as completed
		game.addCompletedActions('CHANGE_ACTIVE_HERMIT')

		// Attack phase complete, mark most actions as blocked now
		game.addBlockedActions(
			'SINGLE_USE_ATTACK',
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD'
		)
	} else {
		// We activated a hermit when we had none active before, allow switching to all other hermits again
		currentPlayer.board.rows.forEach((row) => {
			row.ailments = row.ailments.filter((a) => a.id !== 'knockedout')
		})
	}

	// Run hooks
	currentPlayer.hooks.onActiveHermitChange.call(oldActiveRow, currentPlayer.board.activeRow)

	return 'SUCCESS'
}

export default changeActiveHermit
