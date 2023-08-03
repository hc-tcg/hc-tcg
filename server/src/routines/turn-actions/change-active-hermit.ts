import {GameModel} from 'common/models/game-model'
import {equalCard} from 'common/utils/cards'

function* changeActiveHermit(game: GameModel, turnAction: any, actionState: any) {
	const {currentPlayer} = game
	const {availableActions, pastTurnActions} = actionState
	if (!availableActions.includes('CHANGE_ACTIVE_HERMIT')) return 'INVALID'

	const rowHermitCard = turnAction.payload.row.state.hermitCard
	const result = currentPlayer.board.rows.findIndex((row) =>
		equalCard(row.hermitCard, rowHermitCard)
	)
	if (result === -1) return 'INVALID'

	const isKnockedout = currentPlayer.board.rows[result].ailments.find((a) => a.id === 'knockedout')
	const hasOtherHermits = currentPlayer.board.rows.some(
		(row, index) =>
			!!row.hermitCard && index !== result && !row.ailments.find((a) => a.id === 'knockedout')
	)
	if (isKnockedout && hasOtherHermits) return 'INVALID'

	const hadActiveHermit = currentPlayer.board.activeRow !== null
	currentPlayer.board.activeRow = result

	// After a player has a hermit killed/knockout, he can activate next one
	// without losing the ability to attack again
	if (hadActiveHermit) {
		pastTurnActions.push('CHANGE_ACTIVE_HERMIT')
	} else {
		currentPlayer.board.rows.forEach((row) => {
			row.ailments = row.ailments.filter((a) => a.id !== 'knockedout')
		})
	}

	// Run hooks
	currentPlayer.hooks.onBecomeActive.call(currentPlayer.board.activeRow)

	return 'DONE'
}

export default changeActiveHermit
