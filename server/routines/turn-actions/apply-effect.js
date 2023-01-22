import CARDS from '../../cards'
import {equalCard} from '../../utils'

function* applyEffectSaga(turnAction, state) {
	// TODO - This shouldn't be needed
	turnAction.payload = turnAction.payload || {}
	const {currentPlayer} = state
	const singleUseCard = currentPlayer.board.singleUseCard
	const singleUseInfo = singleUseCard ? CARDS[singleUseCard.cardId] : null
	const {singleUsePick} = turnAction.payload

	// Get active player hermit card for effects that affect active hermit
	const activeRow =
		currentPlayer.board.activeRow !== null
			? currentPlayer.board.rows[currentPlayer.board.activeRow]
			: null
	const hermitCard = activeRow ? activeRow.hermitCard : null
	const hermitInfo = hermitCard ? CARDS[hermitCard.cardId] : null

	// Get picked hermit card for effects that affect selected hermit
	// NOTE - currently only player's hermits are supported
	const pickedRow = singleUsePick
		? currentPlayer.board.rows[singleUsePick.rowIndex]
		: null
	const pickedCard = pickedRow?.hermitCard
	const pickedCardInfo = pickedCard ? CARDS[pickedCard.cardId] : null

	if (singleUseInfo.id === 'instant_health') {
		activeRow.health = Math.min(
			pickedRow.health + 30,
			pickedCardInfo.health // max health
		)
	} else if (singleUseInfo.id === 'instant_health_ii') {
		activeRow.health = Math.min(
			pickedRow.health + 60,
			pickedCardInfo.health // max health
		)
	} else if (singleUseInfo.id === 'golden_apple') {
		activeRow.health = Math.min(
			pickedRow.health + 100,
			pickedCardInfo.health // max health
		)
	} else if (singleUseInfo.id === 'splash_potion_of_healing') {
		for (let row of currentPlayer.board.rows) {
			if (!row.hermitCard) continue
			const currentRowInfo = CARDS[row.hermitCard.cardId]
			if (!currentRowInfo) continue
			row.health = Math.min(row.health + 20, currentRowInfo.health)
		}
	} else {
		return 'INVALID'
	}

	currentPlayer.board.singleUseCardUsed = true
}

export default applyEffectSaga
