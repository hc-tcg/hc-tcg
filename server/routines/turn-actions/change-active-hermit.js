import {equalCard} from '../../utils'

function* changeActiveHermit(turnAction, state) {
	const {currentPlayer} = state
	const rowHermitCard = turnAction.payload.rowHermitCard
	const result = currentPlayer.board.rows.findIndex((row) =>
		equalCard(row.hermitCard, rowHermitCard)
	)
	if (result >= 0) {
		currentPlayer.board.activeRow = result
	}
	return 'DONE'
}

export default changeActiveHermit
