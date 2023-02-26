import {equalCard} from '../../utils'

function* changeActiveHermit(game, turnAction, actionState) {
	const {currentPlayer} = game.ds
	const {availableActions, pastTurnActions} = actionState
	if (!availableActions.includes('CHANGE_ACTIVE_HERMIT')) return 'INVALID'

	const rowHermitCard = turnAction.payload.rowHermitCard
	const result = currentPlayer.board.rows.findIndex((row) =>
		equalCard(row.hermitCard, rowHermitCard)
	)
	if (result === -1) return 'INVALID'

	const isKnockedout = currentPlayer.board.rows[result].ailments.find(
		(a) => a.id === 'knockedout'
	)
	const hasOtherHermits = currentPlayer.board.rows.some(
		(row) =>
			!!row.hermitCard && !row.ailments.find((a) => a.id === 'knockedout')
	)
	if (isKnockedout && hasOtherHermits) return 'INVALID'

	const hadActiveHermit = currentPlayer.board.activeRow !== null
	currentPlayer.board.activeRow = result
	game.hooks.changeActiveHermit.call(turnAction, actionState)

	// After a player has a hermit killed/knockout, he can activate next one
	// without losing the ability to attack again
	if (hadActiveHermit) {
		pastTurnActions.push('CHANGE_ACTIVE_HERMIT')
	}
	return 'DONE'
}

export default changeActiveHermit
