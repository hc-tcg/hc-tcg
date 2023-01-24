import {equalCard, hasSingleUse, applySingleUse} from '../../utils'

function* changeActiveHermit(game, turnAction, derivedState) {
	const {currentPlayer, availableActions, pastTurnActions} = derivedState
	if (!availableActions.includes('CHANGE_ACTIVE_HERMIT')) return 'INVALID'

	const rowHermitCard = turnAction.payload.rowHermitCard
	const result = currentPlayer.board.rows.findIndex((row) =>
		equalCard(row.hermitCard, rowHermitCard)
	)
	const hadActiveHermit = currentPlayer.board.activeRow != null
	if (result >= 0) {
		currentPlayer.board.activeRow = result
	}

	game.hooks.changeActiveHermit.call(turnAction, derivedState)

	// After a player has a hermit killed, he can acitve next one
	// without losing the ability to attack again
	if (hadActiveHermit) {
		pastTurnActions.push('CHANGE_ACTIVE_HERMIT')
	}
	return 'DONE'
}

export default changeActiveHermit
