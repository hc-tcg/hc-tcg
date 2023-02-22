import {equalCard} from '../../utils'

// TODO - free change of hermit at the start of turn after a hermit is knockedout out is only available until another hermit is placed down (that is, you can't change to newly added hermit & attack)
// https://www.youtube.com/watch?v=8iO7KGDxCks - 1:10:30
function* changeActiveHermit(game, turnAction, derivedState) {
	const {currentPlayer, availableActions, pastTurnActions} = derivedState
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
	game.hooks.changeActiveHermit.call(turnAction, derivedState)

	// After a player has a hermit killed/knockout, he can activate next one
	// without losing the ability to attack again
	if (hadActiveHermit) {
		pastTurnActions.push('CHANGE_ACTIVE_HERMIT')
	}
	return 'DONE'
}

export default changeActiveHermit
