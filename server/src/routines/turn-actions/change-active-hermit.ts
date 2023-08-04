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
		equalCard(row.hermitCard, rowHermitCard)
	})
	if (rowIndex === -1) return 'FAILURE_INVALID_DATA'
	const row = currentPlayer.board.rows[rowIndex]

	// Can't change to existing active row
	if (rowIndex === currentPlayer.board.activeRow) return 'FAILURE_CANNOT_COMPLETE'

	// Can't change to knocked out if we have other hermits
	const isKnockedout = row.ailments.find((a) => a.id === 'knockedout')
	const hasOtherHermits = currentPlayer.board.rows.some((row, index) => {
		!!row.hermitCard && index !== rowIndex
	})
	if (isKnockedout && hasOtherHermits) return 'FAILURE_CANNOT_COMPLETE'

	const hadActiveHermit = currentPlayer.board.activeRow !== null
	const oldActiveRow = currentPlayer.board.activeRow

	// Actually change row
	currentPlayer.board.activeRow = rowIndex

	if (hadActiveHermit) {
		// We switched from one hermit to another, prevent this from being done again
		game.addCompletedActions('CHANGE_ACTIVE_HERMIT')
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
